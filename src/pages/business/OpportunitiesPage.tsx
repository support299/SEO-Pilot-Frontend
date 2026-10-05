import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";
import { useSiteHealth } from "@/hooks/useSiteHealth";
import { buildOpportunities } from "@/pages/business/opportunities";

export function OpportunitiesPage() {
  const { business } = useBusiness();
  const sc = useSearchConsole(business.id);
  const ga = useAnalytics(business.id, sc.range);
  const health = useSiteHealth(business.id);

  const scReady = sc.statusState === "error" || (sc.statusState === "loaded" && (!sc.status?.connected || sc.overviewState === "loaded" || sc.overviewState === "error"));
  const healthReady = health.loadState === "loaded" || health.loadState === "error";
  const analyticsReady = ga.statusState === "error" || (ga.statusState === "loaded" && (!ga.status?.connected || ga.overviewState === "loaded" || ga.overviewState === "error"));
  const ready = scReady && healthReady && analyticsReady;

  const crawlCompleted = health.loadState === "loaded" && health.report?.status === "completed";
  const opportunities = ready
    ? buildOpportunities({
        businessId: business.id,
        topQueries: sc.status?.connected && sc.overviewState === "loaded" ? sc.topQueries : null,
        findings: crawlCompleted ? (health.report?.findings ?? []) : null,
        analytics: ga.status?.connected && ga.overviewState === "loaded" ? ga.overview : null,
      })
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Opportunities"
        description="Rows come from this business's stored Search Console top queries, completed crawl findings, and Analytics overview. A row appears only when that source already supports it."
      />

      {!ready ? <LoadingState label="Checking stored Search Console, crawl, and Analytics data…" /> : null}
      {sc.statusState === "error" || (sc.status?.connected && sc.overviewState === "error") ? <ErrorText>Couldn&apos;t load Search Console for this list.</ErrorText> : null}
      {health.loadState === "error" ? <ErrorText>Couldn&apos;t load the crawl for this list.</ErrorText> : null}
      {ga.statusState === "error" || (ga.status?.connected && ga.overviewState === "error") ? <ErrorText>Couldn&apos;t load Analytics for this list.</ErrorText> : null}

      {ready && opportunities.length === 0 ? (
        <EmptyState
          title="No opportunities yet"
          description={`Search Console, the crawl, and Analytics have no usable rows for ${business.name}.`}
        />
      ) : null}

      {opportunities.length > 0 ? (
        <div className="flex flex-col gap-4">
          {opportunities.map((opportunity) => (
            <article key={opportunity.id} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{opportunity.source}</p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">{opportunity.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{opportunity.evidence}</p>
              <Link to={opportunity.href} className="mt-4 inline-flex text-sm font-medium text-primary hover:text-primary-hover">
                {opportunity.linkLabel} →
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
