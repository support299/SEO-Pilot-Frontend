import { useCallback, useEffect, useMemo, useState } from "react";
import { planService } from "@/api/planService";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChecklistItemEditor } from "@/components/plan/ChecklistItemEditor";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import type { ChecklistData, ChecklistRow, ChecklistStatus } from "@/types/plan";

const STATUS_LABEL: Record<ChecklistStatus, string> = {
  not_checked: "Not checked in this workspace",
  verified: "Checked",
  needs_work: "Needs work",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
  n_a: "Not applicable",
  out_of_package: "Outside the package",
};

const STATUS_STYLE: Record<ChecklistStatus, string> = {
  not_checked: "bg-black/5 text-muted",
  verified: "bg-sky-100 text-sky-800",
  needs_work: "bg-amber-100 text-amber-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  blocked: "bg-red-100 text-red-800",
  done: "bg-emerald-100 text-emerald-800",
  n_a: "bg-black/5 text-muted",
  out_of_package: "bg-violet-100 text-violet-800",
};

const selectClass = "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary";

export function ChecklistPage() {
  const { business } = useBusiness();
  const { user } = useAuth();
  const isStaff = Boolean(user?.is_agency_admin);
  const [data, setData] = useState<ChecklistData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await planService.getChecklist(business.id));
      setError(null);
    } catch {
      setError("Couldn't load the checklist right now.");
    }
  }, [business.id]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load();
  }, [load]);

  const categories = useMemo(() => Array.from(new Set(data?.rows.map((row) => row.category) ?? [])), [data]);
  const rows = useMemo(
    () => (data?.rows ?? []).filter((row) => (!category || row.category === category) && (!status || row.status === status) && (!eligibility || row.eligibility === eligibility)),
    [data, category, status, eligibility],
  );

  return (
    <>
      <PageHeader eyebrow="Audit" title="Audit and checklist" description="Every item we look at for this website, what we found, and what is happening next. Items nobody has checked yet say so, they are not assumed missing." />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {!data && !error ? <LoadingState label="Loading checklist…" /> : null}
      {data && !data.loaded ? <EmptyState title="The checklist hasn't been loaded yet" description="The list of items hasn't been set up. Nothing is wrong with this website." /> : null}
      {data && !data.package ? <EmptyState title="No package recorded" description="Set a package for this website to see which items it includes." /> : null}
      {data && data.loaded ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Summary">
            {(Object.keys(STATUS_LABEL) as ChecklistStatus[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(status === key ? "" : key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[key]} ${status === key ? "ring-2 ring-primary" : ""}`}
              >
                {STATUS_LABEL[key]} · {data.summary[key]}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <select aria-label="Category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select aria-label="Package" className={selectClass} value={eligibility} onChange={(e) => setEligibility(e.target.value)}>
              <option value="">Any package eligibility</option>
              <option value="I">Included</option>
              <option value="C">Conditional</option>
              <option value="A">Add-on</option>
              <option value="N">Not included</option>
              <option value="X">Not applicable</option>
            </select>
            <p className="self-center text-xs text-muted">
              Showing {rows.length} of {data.total}
            </p>
          </div>
          <Card className="mt-4 !p-0">
            <ul className="divide-y divide-border" data-testid="checklist-rows">
              {rows.map((row) => (
                <ChecklistListItem key={row.feature_id} row={row} open={openId === row.feature_id} onToggle={() => setOpenId(openId === row.feature_id ? null : row.feature_id)}>
                  {isStaff ? <ChecklistItemEditor businessId={business.id} row={row} onSaved={load} /> : null}
                </ChecklistListItem>
              ))}
              {rows.length === 0 ? <li className="px-4 py-6 text-sm text-muted">Nothing matches these filters.</li> : null}
            </ul>
          </Card>
        </>
      ) : null}
    </>
  );
}

function ChecklistListItem({ row, open, onToggle, children }: { row: ChecklistRow; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <li data-testid={`row-${row.feature_id}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-black/[0.02]">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            <span className="mr-2 text-xs text-muted">{row.feature_id}</span>
            {row.title}
          </p>
          <p className="text-xs text-muted">
            {row.category} · {row.eligibility_label}
            {row.source === "crawl" ? <span className="ml-2 rounded bg-sky-50 px-1.5 py-0.5 font-medium text-sky-800">From site crawl</span> : null}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[row.status]}`}>{STATUS_LABEL[row.status]}</span>
      </button>
      {open ? (
        <div className="flex flex-col gap-2 bg-background px-4 py-3 text-sm">
          {row.status === "not_checked" ? <p className="text-muted">Not checked in this workspace yet. That doesn&apos;t mean it&apos;s missing.</p> : null}
          {row.finding ? (
            <p>
              <span className="font-medium">What we found: </span>
              {row.finding}
            </p>
          ) : null}
          {row.status === "blocked" ? (
            <p>
              <span className="font-medium">Blocked by: </span>
              {row.blocker} (owner: {row.owner})
            </p>
          ) : null}
          {row.next_action ? (
            <p>
              <span className="font-medium">Next: </span>
              {row.next_action}
            </p>
          ) : null}
          {row.status === "done" ? <p className="text-xs text-muted">Done means the work was finished. It doesn&apos;t promise a change in rankings or traffic.</p> : null}
          {row.last_checked_at ? <p className="text-xs text-muted">Last checked {new Date(row.last_checked_at).toLocaleDateString()}</p> : null}
          {row.source === "crawl" ? <p className="text-xs text-muted">Filled in automatically from the latest site crawl. It updates with each crawl until someone reviews it.</p> : null}
          {children}
        </div>
      ) : null}
    </li>
  );
}
