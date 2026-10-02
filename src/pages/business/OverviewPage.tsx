import { Link } from "react-router-dom";
import { CommandCenter } from "@/components/overview/CommandCenter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";
import { useSiteHealth } from "@/hooks/useSiteHealth";
import type { AnalyticsSnapshot } from "@/types/analytics";

export function OverviewPage() {
  const { business } = useBusiness();
  const sc = useSearchConsole(business.id);
  const ga = useAnalytics(business.id, sc.range);
  const health = useSiteHealth(business.id);
  const base = `/businesses/${business.id}`;
  const analyticsReady = ga.statusState === "error" || (ga.statusState === "loaded" && (!ga.status?.connected || ga.overviewState === "loaded" || ga.overviewState === "error"));

  return (
    <>
      <PageHeader
        eyebrow="SEO Command Center"
        title={business.name}
        description="Whether search and Analytics are connected, what they measured, and what still cannot be measured. Empty sources stay unlabeled."
        action={
          <Link to={`${base}/performance`} className="text-sm font-medium text-primary hover:text-primary-hover">
            View performance →
          </Link>
        }
      />

      {sc.statusState === "loading" || sc.statusState === "idle" || ga.statusState === "loading" || ga.statusState === "idle" ? <LoadingState label="Checking this business…" /> : null}
      {sc.statusState === "error" ? <ErrorText>Couldn&apos;t check Search Console right now.</ErrorText> : null}
      {ga.statusState === "error" ? <ErrorText>Couldn&apos;t check Google Analytics right now.</ErrorText> : null}

      {sc.status && !sc.status.connected ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => sc.connect()}>Connect Google Search Console</Button>
          <Link to={`${base}/connections`} className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover">
            Open Connections →
          </Link>
        </div>
      ) : null}

      {sc.status?.connected && (sc.overviewState === "loading" || sc.overviewState === "idle") ? <LoadingState label="Loading Search Console summary…" /> : null}
      {sc.status?.connected && sc.overviewState === "error" ? <ErrorText>Couldn&apos;t load the Search Console summary.</ErrorText> : null}
      {ga.status?.connected && ga.overviewState === "error" ? <ErrorText>Couldn&apos;t load the Google Analytics summary.</ErrorText> : null}

      {sc.status && (!sc.status.connected || sc.overviewState === "loaded") && analyticsReady ? (
        <CommandCenter
          businessId={business.id}
          businessName={business.name}
          status={sc.status}
          range={sc.range}
          overview={sc.overview}
          topQueries={sc.topQueries}
          topPages={sc.topPages}
          crawl={health.report}
          analytics={analyticsSnapshot(ga)}
        />
      ) : null}
    </>
  );
}

function analyticsSnapshot(ga: ReturnType<typeof useAnalytics>): AnalyticsSnapshot {
  if (ga.statusState === "error" || ga.overviewState === "error") {
    return { connected: false, checkFailed: true, synced: false, conversionsMeasurable: false, sessions: null, conversions: null, sessionsDeltaPct: null, conversionsDeltaPct: null };
  }
  if (!ga.status?.connected) {
    return { connected: false, checkFailed: false, synced: false, conversionsMeasurable: false, sessions: null, conversions: null, sessionsDeltaPct: null, conversionsDeltaPct: null };
  }
  const measurable = ga.overview?.conversions_measurable ?? ga.status.conversions_measurable;
  const synced = Boolean(ga.status.last_synced_at) && ga.overviewState === "loaded";
  return {
    connected: true,
    checkFailed: false,
    synced,
    conversionsMeasurable: measurable,
    sessions: synced ? (ga.overview?.summary.sessions ?? 0) : null,
    conversions: measurable && synced ? (ga.overview?.summary.conversions ?? null) : null,
    sessionsDeltaPct: ga.overview?.comparison?.sessions_delta_pct ?? null,
    conversionsDeltaPct: measurable ? (ga.overview?.comparison?.conversions_delta_pct ?? null) : null,
  };
}
