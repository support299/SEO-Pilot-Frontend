import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GridMap } from "@/components/local-visibility/GridMap";
import { LocationSetupForm } from "@/components/local-visibility/LocationSetupForm";
import { StatTile } from "@/components/search-console/StatTile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { TextInput } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { useLocalVisibility } from "@/hooks/useLocalVisibility";
import type { ScanSummary, TrackedKeywordRow } from "@/types/localVisibility";

const fmtRank = (value: number | null) => (value === null ? "—" : value.toFixed(1));
const fmtPct = (value: number | null) => (value === null ? "—" : `${Math.round(value)}%`);
const fmtScore = (value: number | null) => (value === null ? "—" : String(Math.round(value)));

function scoreDelta(latest: ScanSummary | null, previous: ScanSummary | null) {
  if (!latest || !previous || latest.visibility_score === null || previous.visibility_score === null) return null;
  return latest.visibility_score - previous.visibility_score;
}

export function LocalVisibilityPage() {
  const { business } = useBusiness();
  const { user } = useAuth();
  const lv = useLocalVisibility(business.id);
  const [editingLocation, setEditingLocation] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const overview = lv.overview;
  const isAdmin = Boolean(user?.is_agency_admin);

  async function submitKeyword(event: FormEvent) {
    event.preventDefault();
    if (!newKeyword.trim()) return;
    if (await lv.addKeyword(newKeyword)) setNewKeyword("");
  }

  return (
    <>
      <PageHeader
        eyebrow="Local"
        title="Local Visibility"
        description={`Where ${business.name} shows up in Google Maps for the searches that matter, checked from a grid of spots around the business.`}
      />

      {lv.loadState === "loading" || lv.loadState === "idle" ? <LoadingState label="Loading local visibility…" /> : null}
      {lv.loadState === "error" ? <ErrorText>Couldn&apos;t load local visibility right now.</ErrorText> : null}
      {lv.actionError ? <ErrorText>{lv.actionError}</ErrorText> : null}

      {overview && !overview.configured && business.can_edit ? (
        <ErrorText>Rank tracking isn&apos;t switched on yet: the DataForSEO login is missing on the server, so scans can&apos;t run.</ErrorText>
      ) : null}

      {overview && !overview.profile ? (
        business.can_edit ? (
          <Card>
            <h2 className="text-sm font-semibold">Where is the business?</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Set the centre of the grid. We check Google Maps from spots around it.</p>
            <LocationSetupForm profile={null} gridSizes={overview.limits.grid_sizes} busy={lv.busy} onSave={lv.saveProfile} />
          </Card>
        ) : (
          <EmptyState title="Local tracking isn't set up yet" description="Your SEO team is setting this up. Results will appear here once the first scan has run." />
        )
      ) : null}

      {overview?.profile ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Visibility score" value={fmtScore(overview.metrics.visibility_score)} delta={null} />
            <StatTile label="Average rank" value={fmtRank(overview.metrics.average_rank)} delta={null} />
            <StatTile label="Top 3 coverage" value={fmtPct(overview.metrics.top3_coverage)} delta={null} />
            <StatTile label="Top 10 coverage" value={fmtPct(overview.metrics.top10_coverage)} delta={null} />
          </div>
          <p className="-mt-2 text-xs text-muted">
            Visibility score is 0–100: how high the business ranks, averaged over every spot on the grid. Coverage is the share of spots where it ranks in the top 3 or top 10. Averages across all tracked keywords.
          </p>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Keywords</h2>
                <p className="mt-1 text-xs text-muted">
                  {overview.profile.grid_size}×{overview.profile.grid_size} grid, {overview.profile.radius_miles ?? Math.round((overview.profile.radius_km / 1.609344) * 10) / 10} miles reach · looking for {overview.profile.matching_domain || "no website set"}
                  {business.can_edit ? ` · ${overview.limits.scans_today}/${overview.limits.scans_per_day} scans used today` : ""}
                </p>
              </div>
              {business.can_edit && !editingLocation ? (
                <Button variant="secondary" onClick={() => setEditingLocation(true)}>
                  Change location
                </Button>
              ) : null}
            </div>

            {editingLocation ? (
              <div className="mt-4 border-t border-border pt-4">
                <LocationSetupForm profile={overview.profile} gridSizes={overview.limits.grid_sizes} busy={lv.busy} onSave={lv.saveProfile} onCancel={() => setEditingLocation(false)} />
              </div>
            ) : null}

            {overview.keywords.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No keywords yet.{business.can_edit ? " Add the searches customers would use, like “plumber near me”." : ""}</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.06em] text-muted">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Keyword</th>
                      <th className="py-2 pr-3 font-semibold">Avg rank</th>
                      <th className="py-2 pr-3 font-semibold">Visibility</th>
                      <th className="py-2 pr-3 font-semibold">Top 3</th>
                      <th className="py-2 pr-3 font-semibold">Top 10</th>
                      <th className="py-2 font-semibold" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overview.keywords.map((row) => (
                      <KeywordRow
                        key={row.id}
                        row={row}
                        selected={row.id === lv.selectedId}
                        canEdit={business.can_edit}
                        busy={lv.busy}
                        onSelect={() => lv.select(row.id)}
                        onScan={() => lv.startScan(row.id)}
                        onRemove={() => {
                          if (window.confirm(`Stop tracking “${row.keyword}” and delete its history?`)) lv.removeKeyword(row.id);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {business.can_edit && overview.keywords.length < overview.limits.keywords_max ? (
              <form onSubmit={submitKeyword} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <TextInput value={newKeyword} onChange={(event) => setNewKeyword(event.target.value)} placeholder="Add a keyword, e.g. seo services houston" aria-label="New keyword" />
                <Button type="submit" variant="secondary" loading={lv.busy} className="shrink-0">
                  Add keyword
                </Button>
              </form>
            ) : null}
          </Card>

          {lv.detail ? (
            <Card>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">“{lv.detail.keyword.keyword}”</h2>
                  <p className="mt-1 text-xs text-muted">
                    {lv.detail.scan?.finished_at ? `Scanned ${new Date(lv.detail.scan.finished_at).toLocaleString()}` : "Not scanned yet"}
                    {isAdmin && lv.detail.scan?.cost_usd !== undefined ? ` · cost $${lv.detail.scan.cost_usd.toFixed(3)}` : ""}
                  </p>
                </div>
                {lv.detail.history.length >= 2 ? (
                  <div className="w-full max-w-[220px]">
                    <StatTile
                      label="Visibility over time"
                      value={fmtScore(lv.detail.scan?.visibility_score ?? null)}
                      delta={deltaFor(lv.detail.scan, lv.detail.previous)}
                      sparklineValues={lv.detail.history.map((scan) => scan.visibility_score ?? 0)}
                    />
                  </div>
                ) : null}
              </div>
              {lv.detail.scanning ? <LoadingState label="Scanning the grid… this takes about a minute." /> : null}
              {lv.detail.scan?.error ? <p className="mb-3 text-xs text-muted">{lv.detail.scan.error}</p> : null}
              {lv.detail.scan ? (
                <GridMap
                  points={lv.detail.scan.points}
                  size={lv.detail.scan.grid_size}
                  radiusMiles={lv.detail.scan.radius_miles}
                  radiusKm={lv.detail.scan.radius_km}
                  centerLatitude={lv.detail.scan.center_latitude}
                  centerLongitude={lv.detail.scan.center_longitude}
                  businessName={business.name}
                />
              ) : !lv.detail.scanning ? (
                <EmptyState
                  title="No scan yet"
                  description={business.can_edit ? "Run a scan to see where the business ranks around its location." : "The first scan hasn't run yet. Results will appear here."}
                />
              ) : null}
            </Card>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function deltaFor(latest: ScanSummary | null, previous: ScanSummary | null) {
  const delta = scoreDelta(latest, previous);
  return delta === null ? null : ({ kind: "absolute", value: delta, unit: "points", goodDirection: "up" } as const);
}

function KeywordRow({
  row,
  selected,
  canEdit,
  busy,
  onSelect,
  onScan,
  onRemove,
}: {
  row: TrackedKeywordRow;
  selected: boolean;
  canEdit: boolean;
  busy: boolean;
  onSelect: () => void;
  onScan: () => void;
  onRemove: () => void;
}) {
  const delta = scoreDelta(row.latest, row.previous);
  return (
    <tr className={selected ? "bg-primary/5" : ""}>
      <td className="py-3 pr-3">
        <button type="button" onClick={onSelect} className="text-left font-medium hover:text-primary">
          {row.keyword}
        </button>
        {row.last_error ? <p className="mt-0.5 text-xs text-danger">Last scan failed: {row.last_error}</p> : null}
      </td>
      <td className="py-3 pr-3">{fmtRank(row.latest?.average_rank ?? null)}</td>
      <td className="py-3 pr-3">
        {fmtScore(row.latest?.visibility_score ?? null)}
        {delta !== null && Math.abs(delta) >= 1 ? (
          <span className={`ml-1.5 text-xs font-medium ${delta > 0 ? "text-success" : "text-danger"}`}>
            {delta > 0 ? "↑" : "↓"} {Math.abs(Math.round(delta))}
          </span>
        ) : null}
      </td>
      <td className="py-3 pr-3">{fmtPct(row.latest?.top3_coverage ?? null)}</td>
      <td className="py-3 pr-3">{fmtPct(row.latest?.top10_coverage ?? null)}</td>
      <td className="py-3 text-right">
        {row.scanning ? (
          <span className="text-xs text-muted">Scanning…</span>
        ) : canEdit ? (
          <span className="inline-flex gap-2">
            <Button variant="secondary" className="px-3 py-1.5" onClick={onScan} disabled={busy}>
              {row.latest ? "Scan again" : "Scan"}
            </Button>
            <Button variant="secondary" className="px-3 py-1.5" onClick={onRemove} disabled={busy} aria-label={`Remove ${row.keyword}`}>
              Remove
            </Button>
          </span>
        ) : null}
      </td>
    </tr>
  );
}
