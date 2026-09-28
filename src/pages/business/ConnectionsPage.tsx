import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";

export function ConnectionsPage() {
  const { business } = useBusiness();
  const sc = useSearchConsole(business.id);

  return (
    <>
      <PageHeader
        eyebrow="Connections & Measurement"
        title="Connections"
        description="See what SEO Pilot can measure for this business. Unbuilt integrations stay listed as not connected."
      />

      {sc.statusState === "loading" || sc.statusState === "idle" ? <LoadingState label="Checking connections…" /> : null}
      {sc.statusState === "error" ? <ErrorText>Couldn&apos;t check Search Console right now.</ErrorText> : null}

      {sc.status ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Google Search Console</p>
            {sc.status.connected ? (
              <p className="mt-1 text-sm text-muted">Connected · {sc.status.site_url.replace(/^sc-domain:/, "")}</p>
            ) : (
              <p className="mt-1 text-sm text-muted">Not connected</p>
            )}
          </div>
          {sc.status.connected ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/businesses/${business.id}/performance`} className="text-sm font-medium text-primary hover:text-primary-hover">
                View performance →
              </Link>
              <Button variant="danger" onClick={() => sc.disconnect()} loading={sc.isDisconnecting}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={() => sc.connect()}>Connect</Button>
          )}
        </Card>
      ) : null}

      <EmptyState
        title="Other connections are not set up"
        description="Google Analytics, Business Profile, WordPress, CRM, and similar sources are not connected in this phase."
      />
    </>
  );
}
