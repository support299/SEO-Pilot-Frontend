import { Link } from "react-router-dom";
import type { AnalyticsSnapshot } from "@/types/analytics";
import type { SiteHealthReport } from "@/types/siteHealth";
import type { ConnectionStatus, Overview, RangeDays, TopPage, TopQuery } from "@/types/searchConsole";

export type PerformanceState = "winning" | "still" | "losing" | "neutral" | "not_connected";

export type Scorecard = {
  label: string;
  value: string;
  detail: string;
  tone: "observed" | "gap";
  performance: PerformanceState;
  deltaPill?: {
    text: string;
    direction: "up" | "down" | "flat";
  };
  explanation: string;
  badgeOverride?: string;
};

export function CommandCenter({
  businessId,
  businessName,
  status,
  range,
  overview,
  topQueries,
  topPages,
  crawl,
  analytics,
}: {
  businessId: number;
  businessName: string;
  status: ConnectionStatus;
  range: RangeDays;
  overview: Overview | null;
  topQueries: TopQuery[] | null;
  topPages: TopPage[] | null;
  crawl: SiteHealthReport | null;
  analytics: AnalyticsSnapshot;
}) {
  const base = `/businesses/${businessId}`;
  const connected = status.connected;
  const hasRows = Boolean(overview && overview.rows.length > 0);
  const briefing = buildBriefing({ connected, hasRows, overview, topQueries, topPages, range, crawl, analytics });

  return (
    <div className="flex flex-col gap-6">
      {/* Executive Hero Banner */}
      <section className={`relative overflow-hidden rounded-2xl border px-6 py-7 text-white shadow-lg sm:px-8 sm:py-8 ${briefing.bannerTheme}`}>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${briefing.pillTheme}`}>
            <span className="relative flex h-2 w-2">
              {briefing.pulse ? (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${briefing.dotColor}`} />
              ) : null}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${briefing.dotColor}`} />
            </span>
            {briefing.badge}
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            {briefing.evidence}
          </span>
        </div>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{briefing.status}</h2>
        <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">{briefing.explanation}</p>
        <p className="mt-2 text-xs text-slate-400">Range: last {range} days from Search Console.</p>

        {/* Professional Traffic Guide Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-300">Status Guide:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-300">Winning (Traffic up, rank #1 closer, good health)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-medium text-slate-300">Steady (Holding flat, no rank shift)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="font-medium text-slate-300">Losing (Traffic down, dropped rank, needs fix)</span>
          </div>
        </div>
      </section>

      {/* Clean, High-Contrast Scorecards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {briefing.scorecards.map((card) => {
          const style = getCardStyle(card.performance, card.badgeOverride);
          return (
            <article
              key={card.label}
              className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 shadow-xs transition-shadow duration-150 hover:shadow-md ${style.cardClass}`}
            >
              {/* Subtle top indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${style.topBarClass}`} />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {card.label}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold tracking-wide ${style.badgeClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.badgeDotClass}`} />
                    {style.badgeText}
                  </span>
                </div>

                <p className={`mt-3 text-3xl font-bold tracking-tight ${style.valueClass}`}>
                  {card.value}
                </p>

                {card.deltaPill ? (
                  <div className="mt-2.5">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${style.deltaClass}`}>
                      <TrendIcon direction={card.deltaPill.direction} />
                      {card.deltaPill.text}
                    </span>
                  </div>
                ) : null}
              </div>

              <p className="mt-3.5 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-500">
                {card.explanation}
              </p>
            </article>
          );
        })}
      </div>

      {/* Primary Win & Primary Optimization Target */}
      <div className="grid gap-5 xl:grid-cols-2">
        <article className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-white p-6 shadow-xs">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Primary Growth Driver
            </span>
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">{briefing.win.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{briefing.win.detail}</p>
        </article>

        <article className="relative overflow-hidden rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50/40 via-white to-white p-6 shadow-xs">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-rose-800 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              Optimization Priority
            </span>
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">{briefing.problem.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{briefing.problem.detail}</p>
        </article>
      </div>

      {/* Recommended Next Action */}
      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Recommended Next Move
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">{briefing.next.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{briefing.next.detail}</p>
        </div>
        <div className="flex flex-wrap gap-5 border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-sm font-semibold text-primary">
          <Link to={`${base}/performance`} className="hover:text-primary-hover">
            View performance →
          </Link>
          <Link to={`${base}/site-health`} className="hover:text-primary-hover">
            Site Health →
          </Link>
          <Link to={`${base}/connections`} className="hover:text-primary-hover">
            Connections →
          </Link>
        </div>
      </section>

      {!connected ? (
        <p className="text-sm text-slate-500">
          {businessName} has no Search Console property connected. Scorecards above stay unlabeled until Google returns real search data.
        </p>
      ) : null}
    </div>
  );
}

function TrendIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up") {
    return (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
      </svg>
    );
  }
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function getCardStyle(performance: PerformanceState, badgeOverride?: string) {
  switch (performance) {
    case "winning":
      return {
        cardClass: "border-emerald-200/90 bg-gradient-to-b from-emerald-50/35 via-white to-white",
        topBarClass: "bg-emerald-500",
        valueClass: "text-slate-900",
        badgeClass: "bg-emerald-50 border border-emerald-200 text-emerald-700",
        badgeDotClass: "bg-emerald-600",
        badgeText: badgeOverride || "Winning",
        deltaClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      };
    case "losing":
      return {
        cardClass: "border-rose-200/90 bg-gradient-to-b from-rose-50/35 via-white to-white",
        topBarClass: "bg-rose-500",
        valueClass: "text-slate-900",
        badgeClass: "bg-rose-50 border border-rose-200 text-rose-700",
        badgeDotClass: "bg-rose-600",
        badgeText: badgeOverride || "Losing",
        deltaClass: "bg-rose-50 text-rose-700 border-rose-200/80",
      };
    case "still":
      return {
        cardClass: "border-amber-200/90 bg-gradient-to-b from-amber-50/35 via-white to-white",
        topBarClass: "bg-amber-500",
        valueClass: "text-slate-900",
        badgeClass: "bg-amber-50 border border-amber-200 text-amber-800",
        badgeDotClass: "bg-amber-600",
        badgeText: badgeOverride || "Steady",
        deltaClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      };
    case "neutral":
      return {
        cardClass: "border-slate-200 bg-white",
        topBarClass: "bg-slate-400",
        valueClass: "text-slate-900",
        badgeClass: "bg-slate-100 border border-slate-200 text-slate-700",
        badgeDotClass: "bg-slate-500",
        badgeText: badgeOverride || "Observed",
        deltaClass: "bg-slate-50 text-slate-700 border-slate-200",
      };
    case "not_connected":
    default:
      return {
        cardClass: "border-slate-200/80 bg-slate-50/60",
        topBarClass: "bg-slate-300",
        valueClass: "text-slate-400 font-semibold",
        badgeClass: "bg-slate-100 border border-slate-200 text-slate-500",
        badgeDotClass: "bg-slate-400",
        badgeText: badgeOverride || "Not connected",
        deltaClass: "bg-slate-50 text-slate-500 border-slate-200",
      };
  }
}

function evaluatePercentDelta(
  delta: number | null,
  unitLabel: string,
  winningExplainer: string,
  losingExplainer: string,
  stillExplainer: string,
): {
  performance: PerformanceState;
  deltaPill?: { text: string; direction: "up" | "down" | "flat" };
  explanation: string;
} {
  if (delta == null) {
    return {
      performance: "neutral",
      deltaPill: { text: "No prior period to compare", direction: "flat" },
      explanation: `Current ${unitLabel} recorded. Waiting for prior period comparison data.`,
    };
  }
  if (delta > 0.5) {
    return {
      performance: "winning",
      deltaPill: { text: `+${delta.toFixed(1)}% vs previous period`, direction: "up" },
      explanation: winningExplainer,
    };
  }
  if (delta < -0.5) {
    return {
      performance: "losing",
      deltaPill: { text: `${delta.toFixed(1)}% vs previous period`, direction: "down" },
      explanation: losingExplainer,
    };
  }
  return {
    performance: "still",
    deltaPill: { text: `${delta.toFixed(1)}% vs previous period`, direction: "flat" },
    explanation: stillExplainer,
  };
}

function evaluatePosition(
  currentPos: number | null,
  posDelta: number | null,
): {
  value: string;
  performance: PerformanceState;
  deltaPill?: { text: string; direction: "up" | "down" | "flat" };
  explanation: string;
} {
  if (currentPos === null) {
    return {
      value: "—",
      performance: "neutral",
      explanation: "Position not yet recorded by Search Console.",
    };
  }
  const posFormatted = currentPos.toFixed(1);
  if (posDelta == null) {
    return {
      value: posFormatted,
      performance: "neutral",
      deltaPill: { text: "No prior period to compare", direction: "flat" },
      explanation: "Position 1 is the top rank on Google. We will measure movement next period.",
    };
  }
  // Lower rank number is BETTER (rank 1 is best, rank 100 is worst).
  // If posDelta < -0.2 (e.g. current is 5, previous 12 => delta is -7): Improved towards #1!
  if (posDelta < -0.2) {
    const spots = Math.abs(posDelta).toFixed(1);
    return {
      value: posFormatted,
      performance: "winning",
      deltaPill: { text: `Improved ${spots} positions closer to #1`, direction: "up" },
      explanation: "Your website moved higher up Google search results toward #1.",
    };
  }
  // If posDelta > 0.2 (e.g. current is 40.2, previous 31.0 => delta is +9.2): Slipped further down!
  if (posDelta > 0.2) {
    const spots = posDelta.toFixed(1);
    return {
      value: posFormatted,
      performance: "losing",
      deltaPill: { text: `Dropped ${spots} positions further down`, direction: "down" },
      explanation: "Search rankings slipped further down Google search results.",
    };
  }
  return {
    value: posFormatted,
    performance: "still",
    deltaPill: { text: "Held steady vs previous period", direction: "flat" },
    explanation: "Average search ranking remained steady on Google.",
  };
}

function buildBriefing({
  connected,
  hasRows,
  overview,
  topQueries,
  topPages,
  range,
  crawl,
  analytics,
}: {
  connected: boolean;
  hasRows: boolean;
  overview: Overview | null;
  topQueries: TopQuery[] | null;
  topPages: TopPage[] | null;
  range: RangeDays;
  crawl: SiteHealthReport | null;
  analytics: AnalyticsSnapshot;
}): {
  status: string;
  badge: string;
  explanation: string;
  evidence: string;
  dotColor: string;
  pulse: boolean;
  bannerTheme: string;
  pillTheme: string;
  scorecards: Scorecard[];
  win: { title: string; detail: string };
  problem: { title: string; detail: string };
  next: { title: string; detail: string };
} {
  if (!connected) {
    return {
      status: "Search Console Disconnected",
      badge: "Not Connected",
      explanation: "Google Search Console is not connected, so clicks, impressions, and queries cannot be measured yet. Connect it to unlock real search tracking.",
      evidence: "Search Console disconnected",
      dotColor: "bg-slate-400",
      pulse: false,
      bannerTheme: "bg-slate-900 border-slate-800",
      pillTheme: "border-slate-700 bg-slate-800/80 text-slate-300",
      scorecards: [
        gapCard("Organic impressions", "Not connected", "Needs Google Search Console."),
        gapCard("Organic clicks", "Not connected", "Needs Google Search Console."),
        gapCard("Average CTR", "Not connected", "Needs Google Search Console."),
        gapCard("Average position", "Not connected", "Needs Google Search Console."),
        gapCard("Top 10 keywords", "Not connected", "Needs Search Console query snapshot."),
        ...healthCards(crawl, analytics),
      ],
      win: { title: "No win to report", detail: "There is no Search Console query or page snapshot for this business yet." },
      problem: { title: "Search performance is not measured", detail: "Without Search Console, this workspace cannot say whether search is up or down." },
      next: { title: "Connect Google Search Console", detail: "Open Performance or Connections and connect the property for this business to start collecting data." },
    };
  }

  if (!hasRows || !overview) {
    return {
      status: "Waiting for Data Import",
      badge: "Syncing Data",
      explanation: `Search Console is connected, but the last ${range} days have no stored rows. That usually means the initial sync is still running, or Google has no traffic in this timeframe.`,
      evidence: "Connected · waiting on data",
      dotColor: "bg-amber-400",
      pulse: true,
      bannerTheme: "bg-slate-900 border-amber-500/30",
      pillTheme: "border-amber-400/40 bg-amber-500/10 text-amber-300",
      scorecards: [
        gapCard("Organic impressions", "No data yet", `Nothing stored for the last ${range} days.`),
        gapCard("Organic clicks", "No data yet", `Nothing stored for the last ${range} days.`),
        gapCard("Average CTR", "No data yet", `Nothing stored for the last ${range} days.`),
        gapCard("Average position", "No data yet", `Nothing stored for the last ${range} days.`),
        topTenCard(topQueries),
        ...healthCards(crawl, analytics),
      ],
      win: highlight(topQueries, topPages, "win"),
      problem: highlight(topQueries, topPages, "problem"),
      next: { title: "Sync Search Console", detail: "Open Performance and use Sync now. This page will show your 28-day totals once data imports." },
    };
  }

  const { summary, comparison } = overview;
  const clicksUp = comparison?.clicks_delta_pct != null && comparison.clicks_delta_pct > 0;
  const impressionsUp = comparison?.impressions_delta_pct != null && comparison.impressions_delta_pct > 0;
  const clicksDown = comparison?.clicks_delta_pct != null && comparison.clicks_delta_pct < 0;
  const impressionsDown = comparison?.impressions_delta_pct != null && comparison.impressions_delta_pct < 0;

  let status = "Steady · Mixed Performance";
  let badge = "Steady";
  let dotColor = "bg-amber-400";
  let pulse = false;
  let bannerTheme = "bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border-amber-500/30";
  let pillTheme = "border-amber-400/40 bg-amber-500/10 text-amber-300";

  if (clicksUp && impressionsUp) {
    status = "Performance Improving";
    badge = "Winning";
    dotColor = "bg-emerald-400";
    pulse = true;
    bannerTheme = "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border-emerald-500/30";
    pillTheme = "border-emerald-400/40 bg-emerald-500/10 text-emerald-300";
  } else if (clicksDown && impressionsDown) {
    status = "Performance Dropped";
    badge = "Losing";
    dotColor = "bg-rose-400";
    pulse = true;
    bannerTheme = "bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40 border-rose-500/30";
    pillTheme = "border-rose-400/40 bg-rose-500/10 text-rose-300";
  }

  // 1. Organic impressions
  const impEval = evaluatePercentDelta(
    comparison?.impressions_delta_pct ?? null,
    "impressions",
    "Many more searchers discovered your business on Google this period.",
    "Visibility dropped: fewer searchers saw your listing in Google search results.",
    "Search visibility held flat compared to the previous period.",
  );
  const impCard: Scorecard = {
    label: "Organic impressions",
    value: summary.impressions.toLocaleString("en-US"),
    detail: impEval.deltaPill?.text ?? "No prior period",
    tone: "observed",
    performance: impEval.performance,
    deltaPill: impEval.deltaPill,
    explanation: impEval.explanation,
  };

  // 2. Organic clicks
  const clickEval = evaluatePercentDelta(
    comparison?.clicks_delta_pct ?? null,
    "clicks",
    "More searchers clicked through from Google to visit your website.",
    "Website traffic from Google search declined compared to last period.",
    "Search click traffic remained consistent with the previous period.",
  );
  const clickCard: Scorecard = {
    label: "Organic clicks",
    value: summary.clicks.toLocaleString("en-US"),
    detail: clickEval.deltaPill?.text ?? "No prior period",
    tone: "observed",
    performance: clickEval.performance,
    deltaPill: clickEval.deltaPill,
    explanation: clickEval.explanation,
  };

  // 3. Average CTR
  const ctrEval = evaluatePercentDelta(
    comparison?.ctr_delta_pct ?? null,
    "CTR",
    "A higher percentage of searchers who see your listing are clicking through.",
    "Fewer searchers who saw your listing decided to click it. Needs review.",
    "Click-through rate remained consistent across search impressions.",
  );
  const ctrCard: Scorecard = {
    label: "Average CTR",
    value: summary.ctr !== null ? `${(summary.ctr * 100).toFixed(1)}%` : "—",
    detail: ctrEval.deltaPill?.text ?? "No prior period",
    tone: "observed",
    performance: ctrEval.performance,
    deltaPill: ctrEval.deltaPill,
    explanation: ctrEval.explanation,
  };

  // 4. Average position
  const posEval = evaluatePosition(summary.average_position, comparison?.position_delta ?? null);
  const posCard: Scorecard = {
    label: "Average position",
    value: posEval.value,
    detail: posEval.deltaPill?.text ?? "No prior period",
    tone: "observed",
    performance: posEval.performance,
    deltaPill: posEval.deltaPill,
    explanation: posEval.explanation,
  };

  return {
    status,
    badge,
    explanation: statusExplanation(status, range, analytics),
    evidence: "Observed in Search Console",
    dotColor,
    pulse,
    bannerTheme,
    pillTheme,
    scorecards: [
      impCard,
      clickCard,
      ctrCard,
      posCard,
      topTenCard(topQueries),
      ...healthCards(crawl, analytics),
    ],
    win: highlight(topQueries, topPages, "win"),
    problem: highlight(topQueries, topPages, "problem"),
    next: nextFromSnapshot(topQueries, topPages),
  };
}

function healthCards(crawl: SiteHealthReport | null, analytics: AnalyticsSnapshot): Scorecard[] {
  const leads = measurementCards(analytics);
  if (!crawl || crawl.status === "none") {
    return [
      gapCard("SEO Health", "Not yet measurable", "No site crawl has been run."),
      gapCard("Critical issues", "Not yet measurable", "No crawl findings exist for this business."),
      ...leads,
      gapCard("Pages crawled", "Not yet measurable", "Run a site crawl. This is not a Google index count."),
    ];
  }
  if (crawl.status === "queued" || crawl.status === "running") {
    return [
      gapCard("SEO Health", "Crawl in progress", "The crawl has not finished."),
      gapCard("Critical issues", "Crawl in progress", "Findings appear when the crawl finishes."),
      ...leads,
      gapCard("Pages crawled", "Crawl in progress", "Pages appear when the crawl finishes."),
    ];
  }
  if (crawl.status !== "completed" || crawl.score === null) {
    return [
      gapCard("SEO Health", "Crawl failed", crawl.error || "The last crawl did not finish."),
      gapCard("Critical issues", "Crawl failed", "No findings were saved."),
      ...leads,
      gapCard("Pages crawled", "Crawl failed", "No pages were saved from the last crawl."),
    ];
  }

  // SEO Health scorecard
  const score = crawl.score;
  const healthPerformance: PerformanceState = score >= 80 ? "winning" : score >= 60 ? "still" : "losing";
  const healthBadge = score >= 80 ? "Excellent" : score >= 60 ? "Fair" : "Poor";
  const healthExplanation =
    score >= 80
      ? "Solid technical health. Search engines can easily crawl and index your site."
      : score >= 60
        ? "Fair technical health, but SEO improvements can help boost rankings."
        : "Technical errors are hurting website crawlability and Google performance.";

  const healthCard: Scorecard = {
    label: "SEO Health",
    value: `${score} / 100`,
    detail: "From website crawl audit",
    tone: "observed",
    performance: healthPerformance,
    badgeOverride: healthBadge,
    explanation: healthExplanation,
  };

  // Critical issues scorecard
  const issues = crawl.critical_issues;
  const issuesPerformance: PerformanceState = issues === 0 ? "winning" : issues <= 3 ? "still" : "losing";
  const issuesBadge = issues === 0 ? "Clean" : issues <= 3 ? "Warning" : "Urgent";
  const issuesExplanation =
    issues === 0
      ? "Zero broken links or crawl blockers found on your website."
      : issues <= 3
        ? `${issues} technical issue${issues > 1 ? "s" : ""} found that should be addressed.`
        : `${issues} critical broken URLs are blocking search crawlers.`;

  const issuesCard: Scorecard = {
    label: "Critical issues",
    value: String(issues),
    detail: "Crawled URLs that failed to load",
    tone: "observed",
    performance: issuesPerformance,
    badgeOverride: issuesBadge,
    explanation: issuesExplanation,
  };

  // Pages crawled scorecard
  const pagesCard: Scorecard = {
    label: "Pages crawled",
    value: crawl.pages_crawled.toLocaleString("en-US"),
    detail: "Fetched during site crawl audit",
    tone: "observed",
    performance: "neutral",
    badgeOverride: "Observed",
    explanation: `${crawl.pages_crawled.toLocaleString("en-US")} pages fetched from this website. Not Google's indexed count.`,
  };

  return [healthCard, issuesCard, ...leads, pagesCard];
}

function measurementCards(analytics: AnalyticsSnapshot): Scorecard[] {
  const pipeline = gapCard("Organic pipeline", "Not connected", "No CRM attribution is connected yet.");
  if (analytics.checkFailed) {
    return [
      gapCard("Organic sessions", "Not yet measurable", "Google Analytics could not be checked."),
      gapCard("Organic leads", "Not yet measurable", "Google Analytics could not be checked."),
      pipeline,
    ];
  }
  if (!analytics.connected) {
    return [
      gapCard("Organic sessions", "Not connected", "Needs Google Analytics to measure visitor sessions."),
      gapCard("Organic leads", "Not connected", "Needs Google Analytics key events configured."),
      pipeline,
    ];
  }
  if (!analytics.synced) {
    return [
      gapCard("Organic sessions", "No data yet", "Google Analytics is connected. Initial sync in progress."),
      analytics.conversionsMeasurable
        ? gapCard("Organic leads", "No data yet", "Key events configured. Counts appear after sync.")
        : gapCard("Organic leads", "Not yet measurable", "Connected, but no key events are configured in GA4."),
      pipeline,
    ];
  }

  // Sessions card
  const sessions = analytics.sessions ?? 0;
  const sessionsEval = evaluatePercentDelta(
    analytics.sessionsDeltaPct,
    "sessions",
    "Organic search visitor sessions increased vs prior period.",
    "Organic search visitor sessions dropped vs prior period.",
    "Organic search sessions held steady vs prior period.",
  );
  const sessionsCard: Scorecard = {
    label: "Organic sessions",
    value: sessions.toLocaleString("en-US"),
    detail: sessionsEval.deltaPill?.text ?? "Observed in GA4",
    tone: "observed",
    performance: sessionsEval.performance,
    deltaPill: sessionsEval.deltaPill,
    explanation: sessionsEval.explanation,
  };

  // Leads card
  let leadsCard: Scorecard;
  if (analytics.conversionsMeasurable && analytics.conversions !== null) {
    const leadsEval = evaluatePercentDelta(
      analytics.conversionsDeltaPct,
      "conversions",
      "Lead actions and goal conversions from search grew.",
      "Conversions from organic search declined vs prior period.",
      "Lead conversions from organic search remained flat.",
    );
    leadsCard = {
      label: "Organic leads",
      value: analytics.conversions.toLocaleString("en-US"),
      detail: leadsEval.deltaPill?.text ?? "Observed in GA4",
      tone: "observed",
      performance: leadsEval.performance,
      deltaPill: leadsEval.deltaPill,
      explanation: leadsEval.explanation,
    };
  } else {
    leadsCard = gapCard("Organic leads", "Not yet measurable", "This GA4 property has no key events configured.");
  }

  return [sessionsCard, leadsCard, pipeline];
}

function gapCard(label: string, value: string, detail: string): Scorecard {
  return {
    label,
    value,
    detail,
    tone: "gap",
    performance: "not_connected",
    explanation: detail,
  };
}

function topTenCard(queries: TopQuery[] | null): Scorecard {
  if (!queries || queries.length === 0) {
    return gapCard("Top 10 keywords", "Not enough data", "The latest query snapshot is empty. Need real search queries.");
  }
  const count = queries.filter((query) => query.position <= 10).length;
  const performance: PerformanceState = count >= 5 ? "winning" : count > 0 ? "still" : "losing";
  const badgeOverride = count >= 5 ? "Winning" : count > 0 ? "Steady" : "Losing";
  const explanation =
    count >= 5
      ? `${count} of ${queries.length} queries are on Page 1 of Google. Strong organic ranking footprint.`
      : count > 0
        ? `${count} query on Page 1. Good foundation to optimize more keywords into the top 10.`
        : "None of your tracked search queries are on Page 1 of Google yet.";

  return {
    label: "Top 10 keywords",
    value: String(count),
    detail: `Of ${queries.length} queries in top snapshot with average position 10 or better.`,
    tone: "observed",
    performance,
    badgeOverride,
    explanation,
  };
}

function statusExplanation(status: string, range: number, analytics: AnalyticsSnapshot): string {
  if (status.includes("Improving")) {
    return `Clicks and impressions are both higher than the previous ${range} days. Search visibility is expanding. ${leadClause(analytics)}`;
  }
  if (status.includes("Dropped")) {
    return `Clicks and impressions are both lower than the previous ${range} days. Immediate SEO optimization is recommended.`;
  }
  if (status.includes("Steady") || status.includes("Mixed")) {
    return `Some search metrics grew while others dipped over the last ${range} days. Check individual cards below for specific strengths and gaps.`;
  }
  return `Search Console totals are in for the last ${range} days. More history will uncover longer-term trends.`;
}

function leadClause(analytics: AnalyticsSnapshot): string {
  if (analytics.checkFailed) return "Organic leads could not be checked.";
  if (!analytics.connected) return "Organic leads are not connected.";
  if (!analytics.conversionsMeasurable) return "Organic leads are not measurable until this GA4 property has a key event.";
  return "Organic leads count configured GA4 key events.";
}

type Row = { label: string; kind: "query" | "page"; clicks: number; impressions: number; position: number; ctr: number };

function snapshotRows(queries: TopQuery[] | null, pages: TopPage[] | null): Row[] {
  const queryRows = (queries ?? []).map((query) => ({
    label: query.query,
    kind: "query" as const,
    clicks: query.clicks,
    impressions: query.impressions,
    position: query.position,
    ctr: query.ctr,
  }));
  const pageRows = (pages ?? []).map((page) => ({
    label: shortenPage(page.page),
    kind: "page" as const,
    clicks: page.clicks,
    impressions: page.impressions,
    position: page.position,
    ctr: page.ctr,
  }));
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
    detail: `${chosen.clicks.toLocaleString("en-US")} clicks, ${chosen.impressions.toLocaleString("en-US")} impressions, ${(chosen.ctr * 100).toFixed(1)}% CTR, average position ${chosen.position.toFixed(1)}. From the latest 28-day snapshot.`,
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
    detail: `It has the weakest average position in the current snapshot (${weakest.position.toFixed(1)}). Focus SEO improvements here to regain lost ground.`,
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
