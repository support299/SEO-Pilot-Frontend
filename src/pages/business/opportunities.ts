import type { AnalyticsOverview } from "@/types/analytics";
import type { SiteHealthFinding } from "@/types/siteHealth";
import type { TopQuery } from "@/types/searchConsole";

export type OpportunitySource = "Search Console" | "crawl" | "Analytics";

export type Opportunity = {
  id: string;
  title: string;
  evidence: string;
  source: OpportunitySource;
  href: string;
  linkLabel: string;
};

const CRAWL_FINDING_TITLES = new Set([
  "Missing title",
  "Duplicate title",
  "Missing meta description",
  "Duplicate meta description",
  "Page asks not to be indexed",
  "Page did not load",
]);

export function buildOpportunities({
  businessId,
  topQueries,
  findings,
  analytics,
}: {
  businessId: number;
  topQueries: TopQuery[] | null;
  findings: SiteHealthFinding[] | null;
  analytics: AnalyticsOverview | null;
}): Opportunity[] {
  const base = `/businesses/${businessId}`;
  const rows: Opportunity[] = [];

  for (const query of topQueries ?? []) {
    if (query.impressions <= 0 || query.position <= 10) continue;
    const position = query.position.toFixed(1);
    const impressions = query.impressions.toLocaleString("en-US");
    const impressionLabel = query.impressions === 1 ? "impression" : "impressions";
    rows.push({
      id: `query:${query.query}`,
      title: `"${query.query}" is outside the top 10`,
      evidence: `In the latest top-query snapshot, "${query.query}" has ${impressions} ${impressionLabel} and an average position of ${position}. That position is outside the top 10. This snapshot is not a full keyword inventory.`,
      source: "Search Console",
      href: `${base}/performance`,
      linkLabel: "View performance",
    });
  }

  for (const finding of findings ?? []) {
    if (!CRAWL_FINDING_TITLES.has(finding.title)) continue;
    const quoted = finding.url ? `${finding.detail} Page: ${finding.url}` : finding.detail;
    rows.push({
      id: `finding:${finding.title}:${finding.url}`,
      title: finding.title,
      evidence: quoted,
      source: "crawl",
      href: `${base}/site-health`,
      linkLabel: "View site health",
    });
  }

  const conversions = analytics?.summary.conversions;
  if (analytics?.conversions_measurable && analytics.summary.sessions > 0 && conversions === 0) {
    const sessions = analytics.summary.sessions.toLocaleString("en-US");
    rows.push({
      id: "analytics:organic-zero-conversions",
      title: "Organic sessions with no conversions",
      evidence: `The organic overview for the last ${analytics.range_days} days shows ${sessions} sessions and 0 conversions. Conversions are measurable for this property.`,
      source: "Analytics",
      href: `${base}/overview`,
      linkLabel: "View overview",
    });
  }

  return rows;
}
