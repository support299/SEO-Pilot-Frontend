import { Link } from "react-router-dom";
import type { ConnectionStatus, Overview, RangeDays, TopPage, TopQuery } from "@/types/searchConsole";

type Scorecard = {
  label: string;
  value: string;
  detail: string;
  tone: "observed" | "gap";
};

export function CommandCenter({
  businessId,
  businessName,
  status,
  range,
  overview,
  topQueries,
  topPages,
}: {
  businessId: number;
  businessName: string;
  status: ConnectionStatus;
  range: RangeDays;
  overview: Overview | null;
  topQueries: TopQuery[] | null;
  topPages: TopPage[] | null;
}) {
  const base = `/businesses/${businessId}`;
  const connected = status.connected;
  const hasRows = Boolean(overview && overview.rows.length > 0);
  const briefing = buildBriefing({ connected, hasRows, overview, topQueries, topPages, range });

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-foreground px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.11em] text-white/80">
            <span className={`h-2 w-2 rounded-full ${briefing.dot}`} />
            SEO status
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70">{briefing.evidence}</span>
        </div>
        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{briefing.status}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">{briefing.explanation}</p>
        <p className="mt-3 text-xs text-white/55">Range: last {range} days from Search Console.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {briefing.scorecards.map((card) => (
          <article key={card.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted">{card.label}</p>
              <span className={`text-[0.65rem] font-bold uppercase tracking-[0.08em] ${card.tone === "observed" ? "text-success" : "text-muted"}`}>
                {card.tone === "observed" ? "Observed" : "Not measured"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{card.value}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-success">Biggest win</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">{briefing.win.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{briefing.win.detail}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#b54708]">Biggest problem</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">{briefing.problem.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{briefing.problem.detail}</p>
        </article>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Next action</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">{briefing.next.title}</h3>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">{briefing.next.detail}</p>
        </div>
        <div className="flex flex-wrap gap-4 border-t border-border bg-background px-5 py-4 sm:px-6">
          <Link to={`${base}/performance`} className="text-sm font-medium text-primary hover:text-primary-hover">
            View performance →
          </Link>
          <Link to={`${base}/site-health`} className="text-sm font-medium text-primary hover:text-primary-hover">
            Site Health →
          </Link>
          <Link to={`${base}/connections`} className="text-sm font-medium text-primary hover:text-primary-hover">
            Connections →
          </Link>
        </div>
      </section>

      {!connected ? (
        <p className="text-sm text-muted">
          {businessName} has no Search Console property connected. Scorecards above stay unlabeled until Google returns real search data.
        </p>
      ) : null}
    </div>
  );
}

function buildBriefing({
  connected,
  hasRows,
  overview,
  topQueries,
  topPages,
  range,
}: {
  connected: boolean;
  hasRows: boolean;
  overview: Overview | null;
  topQueries: TopQuery[] | null;
  topPages: TopPage[] | null;
  range: RangeDays;
}): {
  status: string;
  explanation: string;
  evidence: string;
  dot: string;
  scorecards: Scorecard[];
  win: { title: string; detail: string };
  problem: { title: string; detail: string };
  next: { title: string; detail: string };
} {
  const gaps = gapScorecards();

  if (!connected) {
    return {
      status: "Not connected",
      explanation: "Google Search Console is not connected, so clicks, impressions, and queries cannot be shown. Connect it before treating any search number as real.",
      evidence: "Search Console disconnected",
      dot: "bg-[#f04438]",
      scorecards: [
        gapCard("Organic impressions", "Not connected", "Needs Google Search Console."),
        gapCard("Organic clicks", "Not connected", "Needs Google Search Console."),
        gapCard("Average CTR", "Not connected", "Needs Google Search Console."),
        gapCard("Average position", "Not connected", "Needs Google Search Console."),
        gapCard("Top 10 keywords", "Not connected", "Needs the Search Console query snapshot."),
        ...gaps,
      ],
      win: { title: "No win to report", detail: "There is no Search Console query or page snapshot for this business yet." },
      problem: { title: "Search performance is not measured", detail: "Without Search Console, this workspace cannot say whether search is up or down." },
      next: { title: "Connect Google Search Console", detail: "Open Performance or Connections and connect the property for this business. No other source is wired in this phase." },
    };
  }

  if (!hasRows || !overview) {
    return {
      status: "No data yet",
      explanation: `Search Console is connected, but the last ${range} days have no stored rows. That usually means the first sync has not finished, or Google has no traffic in this period.`,
      evidence: "Connected · waiting on data",
      dot: "bg-[#f79009]",
      scorecards: [
        gapCard("Organic impressions", "No data yet", `Nothing stored for the last ${range} days.`),
        gapCard("Organic clicks", "No data yet", `Nothing stored for the last ${range} days.`),
        gapCard("Average CTR", "No data yet", `Nothing stored for the last ${range} days.`),
        gapCard("Average position", "No data yet", `Nothing stored for the last ${range} days.`),
        topTenCard(topQueries),
        ...gaps,
      ],
      win: highlight(topQueries, topPages, "win"),
      problem: highlight(topQueries, topPages, "problem"),
      next: { title: "Sync Search Console", detail: "Open Performance and use Sync now. This page will show the same 28-day totals once rows exist." },
    };
  }

  const { summary, comparison } = overview;
  const clicksUp = comparison?.clicks_delta_pct != null && comparison.clicks_delta_pct > 0;
  const impressionsUp = comparison?.impressions_delta_pct != null && comparison.impressions_delta_pct > 0;
  const clicksDown = comparison?.clicks_delta_pct != null && comparison.clicks_delta_pct < 0;
  const impressionsDown = comparison?.impressions_delta_pct != null && comparison.impressions_delta_pct < 0;

  let status = "Measured";
  let dot = "bg-[#47cd89]";
  if (clicksUp && impressionsUp) status = "Improving";
  else if (clicksDown && impressionsDown) {
    status = "Down";
    dot = "bg-[#f04438]";
  } else if (comparison) {
    status = "Mixed";
    dot = "bg-[#f79009]";
  }

  return {
    status,
    explanation: statusExplanation(status, range),
    evidence: "Observed in Search Console",
    dot,
    scorecards: [
      observedCard("Organic impressions", summary.impressions.toLocaleString("en-US"), percentDetail(comparison?.impressions_delta_pct ?? null)),
      observedCard("Organic clicks", summary.clicks.toLocaleString("en-US"), percentDetail(comparison?.clicks_delta_pct ?? null)),
      observedCard("Average CTR", summary.ctr !== null ? `${(summary.ctr * 100).toFixed(1)}%` : "—", percentDetail(comparison?.ctr_delta_pct ?? null)),
      observedCard(
        "Average position",
        summary.average_position !== null ? summary.average_position.toFixed(1) : "—",
        comparison?.position_delta != null ? `${formatSigned(comparison.position_delta)} positions vs previous period` : "No prior period to compare",
      ),
      topTenCard(topQueries),
      ...gaps,
    ],
    win: highlight(topQueries, topPages, "win"),
    problem: highlight(topQueries, topPages, "problem"),
    next: nextFromSnapshot(topQueries, topPages),
  };
}

function gapScorecards(): Scorecard[] {
  return [
    gapCard("SEO Health", "Not yet measurable", "No site crawl is connected."),
    gapCard("Critical issues", "Not yet measurable", "No crawl findings exist for this business."),
    gapCard("Organic leads", "Not connected", "Google Analytics and CRM are not connected."),
    gapCard("Organic pipeline", "Not connected", "No CRM attribution is connected."),
    gapCard("Indexed pages", "Not yet measurable", "No crawl or index-coverage API is connected."),
  ];
}

function observedCard(label: string, value: string, detail: string): Scorecard {
  return { label, value, detail, tone: "observed" };
}

function gapCard(label: string, value: string, detail: string): Scorecard {
  return { label, value, detail, tone: "gap" };
}

function topTenCard(queries: TopQuery[] | null): Scorecard {
  if (!queries || queries.length === 0) {
    return gapCard("Top 10 keywords", "Not enough data", "The latest top-query snapshot is empty. This is not a full keyword inventory.");
  }
  const count = queries.filter((query) => query.position <= 10).length;
  return observedCard(
    "Top 10 keywords",
    String(count),
    `Of ${queries.length} queries in the latest 28-day snapshot with average position 10 or better. Not a full keyword count.`,
  );
}

function percentDetail(delta: number | null): string {
  if (delta == null) return "No prior period to compare";
  return `${formatSigned(delta)}% vs previous period`;
}

function formatSigned(value: number): string {
  const rounded = Math.abs(value).toFixed(1);
  if (value > 0) return `+${rounded}`;
  if (value < 0) return `-${rounded}`;
  return rounded;
}

function statusExplanation(status: string, range: number): string {
  if (status === "Improving") return `Clicks and impressions are both higher than the previous ${range} days. Lead and crawl numbers are still not measured.`;
  if (status === "Down") return `Clicks and impressions are both lower than the previous ${range} days. This is search performance only.`;
  if (status === "Mixed") return `Clicks and impressions moved in different directions over the last ${range} days. Compare them on Performance before calling a trend.`;
  return `Search Console totals are in for the last ${range} days. There is not enough prior-period history to call the trend up or down.`;
}

type Row = { label: string; kind: "query" | "page"; clicks: number; impressions: number; position: number; ctr: number };

function snapshotRows(queries: TopQuery[] | null, pages: TopPage[] | null): Row[] {
  const queryRows = (queries ?? []).map((query) => ({ label: query.query, kind: "query" as const, clicks: query.clicks, impressions: query.impressions, position: query.position, ctr: query.ctr }));
  const pageRows = (pages ?? []).map((page) => ({ label: shortenPage(page.page), kind: "page" as const, clicks: page.clicks, impressions: page.impressions, position: page.position, ctr: page.ctr }));
  return [...queryRows, ...pageRows].filter((row) => row.impressions > 0 || row.clicks > 0);
}

function highlight(queries: TopQuery[] | null, pages: TopPage[] | null, which: "win" | "problem"): { title: string; detail: string } {
  const rows = snapshotRows(queries, pages);
  if (rows.length === 0) {
    return which === "win"
      ? { title: "No win to report", detail: "The latest query and page snapshot has no clicks or impressions yet." }
      : { title: "No search problem to name", detail: "There is no query or page row to compare. Sync again if a property was just connected." };
  }

  const strongest = [...rows].sort((a, b) => b.clicks - a.clicks || a.position - b.position)[0];
  const rankedWeak = [...rows].sort((a, b) => b.position - a.position || a.clicks - b.clicks);
  const weakest = rankedWeak.find((row) => row.label !== strongest?.label || row.kind !== strongest?.kind) ?? rankedWeak[0];
  const chosen = which === "win" ? strongest : weakest;
  if (!chosen || !strongest) {
    return { title: "No data yet", detail: "The snapshot could not be compared." };
  }
  const noun = chosen.kind === "query" ? "Query" : "Page";

  if (which === "problem" && chosen.label === strongest.label && rows.length === 1) {
    return {
      title: "Only one measured row",
      detail: `${noun} “${chosen.label}” is the only snapshot row, at position ${chosen.position.toFixed(1)}. There is no separate weaker query or page to call out.`,
    };
  }

  return {
    title: which === "win" ? `${noun} with the most clicks: ${chosen.label}` : `Weakest average position: ${chosen.label}`,
    detail: `${chosen.clicks.toLocaleString("en-US")} clicks, ${chosen.impressions.toLocaleString("en-US")} impressions, ${(chosen.ctr * 100).toFixed(1)}% CTR, average position ${chosen.position.toFixed(1)}. From the latest 28-day top snapshot, not a full inventory.`,
  };
}

function nextFromSnapshot(queries: TopQuery[] | null, pages: TopPage[] | null): { title: string; detail: string } {
  const rows = snapshotRows(queries, pages);
  if (rows.length === 0) {
    return { title: "Review Performance after the next sync", detail: "Totals are in, but the query and page snapshot is still empty, so there is no specific row to act on." };
  }
  const weakest = [...rows].sort((a, b) => b.position - a.position || a.clicks - b.clicks)[0];
  if (!weakest) {
    return { title: "Review Performance after the next sync", detail: "Totals are in, but the query and page snapshot is still empty, so there is no specific row to act on." };
  }
  return {
    title: `Review “${weakest.label}” on Performance`,
    detail: `It has the weakest average position in the current snapshot (${weakest.position.toFixed(1)}). This is a reading of Search Console, not an automated plan.`,
  };
}

function shortenPage(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search || "/";
  } catch {
    return url;
  }
}
