import { Link } from "react-router-dom";
import { CommandCenter } from "@/components/overview/CommandCenter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";
import { useSiteHealth } from "@/hooks/useSiteHealth";

export function OverviewPage() {
  const { business } = useBusiness();
  const sc = useSearchConsole(business.id);
  const health = useSiteHealth(business.id);
  const base = `/businesses/${business.id}`;

  return (
    <>
      <PageHeader
        eyebrow="SEO Command Center"
        title={business.name}
        description="Whether search is connected, what Search Console measured, and what still cannot be measured. Empty sources stay unlabeled."
        action={
          <Link to={`${base}/performance`} className="text-sm font-medium text-primary hover:text-primary-hover">
            View performance →
          </Link>
        }
      />

      {sc.statusState === "loading" || sc.statusState === "idle" ? <LoadingState label="Checking this business…" /> : null}
      {sc.statusState === "error" ? <ErrorText>Couldn&apos;t check Search Console right now.</ErrorText> : null}

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

      {sc.status && (!sc.status.connected || sc.overviewState === "loaded") ? (
        <CommandCenter
          businessId={business.id}
          businessName={business.name}
          status={sc.status}
          range={sc.range}
          overview={sc.overview}
          topQueries={sc.topQueries}
          topPages={sc.topPages}
          crawl={health.report}
        />
      ) : null}
    </>
  );
}
