import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchConsoleDashboard } from "@/components/search-console/SearchConsoleDashboard";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorText, LoadingState, SuccessText } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";

const SC_ERROR_MESSAGES: Record<string, string> = {
  denied: "You didn't grant access, so nothing was connected.",
  connection_failed: "Something went wrong connecting to Google. Please try again.",
};

export function PerformancePage() {
  const { business } = useBusiness();
  const [searchParams] = useSearchParams();
  const sc = useSearchConsole(business.id);

  const scError = searchParams.get("scError");
  const scConnected = searchParams.get("scConnected");

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title="Search performance"
        description={`Observed Google Search Console data for ${business.name}. Empty until a property is connected.`}
      />

      {scError ? <ErrorText>{SC_ERROR_MESSAGES[scError] ?? "Something went wrong."}</ErrorText> : null}
      {scConnected ? <SuccessText>Google Search Console connected. Syncing your first data now…</SuccessText> : null}

      {sc.statusState === "loading" || sc.statusState === "idle" ? <LoadingState label="Checking Search Console connection…" /> : null}
      {sc.statusState === "error" ? <ErrorText>Couldn&apos;t check Search Console right now.</ErrorText> : null}

      {sc.statusState === "loaded" && sc.status && !sc.status.connected ? (
        <EmptyState
          title="No SEO data yet"
          description={`Connect Google Search Console to start seeing real search performance for ${business.name} — clicks, impressions, and what needs attention.`}
          action={<Button onClick={() => sc.connect()}>Connect Google Search Console</Button>}
        />
      ) : null}

      {sc.status?.connected ? (
        <SearchConsoleDashboard
          siteUrl={sc.status.site_url}
          lastSyncedAt={sc.status.last_synced_at}
          lastSyncError={sc.status.last_sync_error}
          range={sc.range}
          onRangeChange={sc.setRange}
          overviewState={sc.overviewState}
          overview={sc.overview}
          topQueries={sc.topQueries}
          topPages={sc.topPages}
          isSyncing={sc.isSyncing}
          onSync={() => sc.sync()}
          isDisconnecting={sc.isDisconnecting}
          onDisconnect={() => sc.disconnect()}
        />
      ) : null}
    </>
  );
}
