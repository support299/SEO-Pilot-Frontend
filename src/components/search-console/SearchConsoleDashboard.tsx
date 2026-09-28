import { DateRangeTabs } from "@/components/search-console/DateRangeTabs";
import { StatTile } from "@/components/search-console/StatTile";
import { TopTable } from "@/components/search-console/TopTable";
import { TrendChart } from "@/components/search-console/TrendChart";
import { Button } from "@/components/ui/Button";
import { ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useSearchConsole } from "@/hooks/useSearchConsole";

export function SearchConsoleDashboard({
  siteUrl,
  lastSyncedAt,
  lastSyncError,
  range,
  onRangeChange,
  overviewState,
  overview,
  topQueries,
  topPages,
  isSyncing,
  onSync,
  isDisconnecting,
  onDisconnect,
}: {
  siteUrl: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  range: 7 | 28 | 90;
  onRangeChange: (days: 7 | 28 | 90) => void;
  overviewState: "idle" | "loading" | "loaded" | "error";
  overview: ReturnType<typeof useSearchConsole>["overview"];
  topQueries: ReturnType<typeof useSearchConsole>["topQueries"];
  topPages: ReturnType<typeof useSearchConsole>["topPages"];
  isSyncing: boolean;
  onSync: () => void;
  isDisconnecting: boolean;
  onDisconnect: () => void;
}) {
  const displayName = siteUrl.replace(/^sc-domain:/, "");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Search performance</h2>
          <p className="mt-0.5 text-xs text-muted">
            {displayName} · {lastSyncedAt ? `Last synced ${formatRelative(lastSyncedAt)}` : "Waiting for first sync"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeTabs active={range} onChange={onRangeChange} />
          <Button variant="secondary" onClick={onSync} loading={isSyncing}>
            Sync now
          </Button>
          <Button variant="danger" onClick={onDisconnect} loading={isDisconnecting}>
            Disconnect
          </Button>
        </div>
      </div>

      {lastSyncError ? <ErrorText>The last sync failed: {lastSyncError}. We&apos;ll keep showing the most recent data.</ErrorText> : null}

      {overviewState === "loading" || overviewState === "idle" ? <LoadingState label="Loading search performance…" /> : null}
      {overviewState === "error" ? <ErrorText>Couldn&apos;t load search performance right now.</ErrorText> : null}

      {overview && overview.rows.length === 0 ? (
        <p className="text-sm text-muted">
          No data yet for this range — Google may not have finished processing this property, or there&apos;s no traffic in this period. Try syncing again shortly.
        </p>
      ) : null}

      {overview && overview.rows.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Clicks"
              value={overview.summary.clicks.toLocaleString("en-US")}
              delta={overview.comparison?.clicks_delta_pct != null ? { kind: "percent", value: overview.comparison.clicks_delta_pct, goodDirection: "up" } : null}
              sparklineValues={overview.rows.map((r) => r.clicks)}
            />
            <StatTile
              label="Impressions"
              value={overview.summary.impressions.toLocaleString("en-US")}
              delta={overview.comparison?.impressions_delta_pct != null ? { kind: "percent", value: overview.comparison.impressions_delta_pct, goodDirection: "up" } : null}
              sparklineValues={overview.rows.map((r) => r.impressions)}
            />
            <StatTile
              label="Average CTR"
              value={overview.summary.ctr !== null ? `${(overview.summary.ctr * 100).toFixed(1)}%` : "—"}
              delta={overview.comparison?.ctr_delta_pct != null ? { kind: "percent", value: overview.comparison.ctr_delta_pct, goodDirection: "up" } : null}
              sparklineValues={overview.rows.map((r) => r.ctr)}
            />
            <StatTile
              label="Average position"
              value={overview.summary.average_position !== null ? overview.summary.average_position.toFixed(1) : "—"}
              delta={overview.comparison?.position_delta != null ? { kind: "absolute", value: overview.comparison.position_delta, unit: "positions", goodDirection: "down" } : null}
              sparklineValues={overview.rows.map((r) => r.position)}
            />
          </div>

          <TrendChart rows={overview.rows} />
        </>
      ) : null}

      {topQueries && topPages ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TopTable title="Top search queries" labelHeader="Query" rows={topQueries.map((q) => ({ label: q.query, ...q }))} />
          <TopTable title="Top pages" labelHeader="Page" rows={topPages.map((p) => ({ label: shortenPage(p.page, displayName), ...p }))} />
        </div>
      ) : null}
    </div>
  );
}

function shortenPage(url: string, siteHost: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search || "/";
  } catch {
    return url.replace(siteHost, "");
  }
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
