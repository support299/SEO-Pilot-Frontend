import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkline } from "@/components/search-console/Sparkline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryEvent } from "@/types/history";

const SOURCE_LABELS: Record<string, string> = {
  approval: "Approval",
  crawl: "Site Health",
  search_console: "Search Console",
  analytics: "Analytics",
};

export function HistoryPage() {
  const { business } = useBusiness();
  const { events, scoreTrend, hasMore, loadState, loadMore } = useHistory(business.id);
  const days = groupByDay(events);
  const firstLoad = loadState === "idle" || (loadState === "loading" && events.length === 0);

  return (
    <>
      <PageHeader
        eyebrow="History & Proof"
        title="History"
        description="A record of what actually happened for this business: crawls, approval decisions, and Google connection changes. Entries start from when SEO Pilot began recording them, plus past crawls."
      />

      {firstLoad ? <LoadingState label="Loading history…" /> : null}
      {loadState === "error" ? <ErrorText>Couldn&apos;t load history right now.</ErrorText> : null}

      {loadState === "loaded" && events.length === 0 ? (
        <EmptyState title="No history yet" description={`Nothing has been recorded for ${business.name} yet.`} />
      ) : null}

      {scoreTrend.length >= 2 ? (
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Site Health score over time</p>
            <p className="mt-1 text-sm text-muted">
              {scoreTrend.length} completed crawls, from {scoreTrend[0]!.score} to {scoreTrend[scoreTrend.length - 1]!.score}. This is not a Google score.
            </p>
          </div>
          <Sparkline values={scoreTrend.map((point) => point.score)} width={160} height={40} />
        </Card>
      ) : null}

      {days.map(([day, rows]) => (
        <section key={day} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">{day}</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <ul>
              {rows.map((event) => (
                <li key={event.id} className="flex flex-col gap-1 border-b border-border/60 px-5 py-4 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
                  <p className="w-32 shrink-0 text-xs font-bold uppercase tracking-[0.08em] text-muted">{sourceLabel(event.kind)}</p>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{event.summary}</p>
                    {event.actor ? <p className="mt-1 text-xs text-muted">by {event.actor}</p> : null}
                  </div>
                  <p className="shrink-0 text-xs tabular-nums text-muted">{new Date(event.occurred_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {hasMore ? (
        <div>
          <Button variant="secondary" loading={loadState === "loading"} onClick={loadMore}>
            Load older entries
          </Button>
        </div>
      ) : null}
    </>
  );
}

function sourceLabel(kind: string) {
  return SOURCE_LABELS[kind.split(".")[0] ?? ""] ?? "Activity";
}

function groupByDay(events: HistoryEvent[]) {
  const groups = new Map<string, HistoryEvent[]>();
  for (const event of events) {
    const day = new Date(event.occurred_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const rows = groups.get(day) ?? [];
    rows.push(event);
    groups.set(day, rows);
  }
  return [...groups.entries()];
}
