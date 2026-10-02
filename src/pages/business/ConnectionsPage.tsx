import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState, SuccessText } from "@/components/ui/Feedback";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";

const GA_ERROR_MESSAGES: Record<string, string> = {
  denied: "You didn't grant access, so Google Analytics was not connected.",
  no_property: "That Google account has no Analytics property matching this business website.",
  connection_failed: "Something went wrong connecting to Google Analytics. Please try again.",
};

export function ConnectionsPage() {
  const { business } = useBusiness();
  const [searchParams] = useSearchParams();
  const sc = useSearchConsole(business.id);
  const ga = useAnalytics(business.id, 28);
  const gaError = searchParams.get("gaError");
  const gaDetail = searchParams.get("gaDetail");
  const gaConnected = searchParams.get("gaConnected");

  return (
    <>
      <PageHeader
        eyebrow="Connections & Measurement"
        title="Connections"
        description="See what SEO Pilot can measure for this business. Unbuilt integrations stay listed as not connected."
      />

      {gaError ? <ErrorText>{gaDetail || GA_ERROR_MESSAGES[gaError] || "Something went wrong connecting Google Analytics."}</ErrorText> : null}
      {gaConnected ? <SuccessText>Google Analytics connected. Syncing organic sessions now…</SuccessText> : null}

      {sc.statusState === "loading" || sc.statusState === "idle" ? <LoadingState label="Checking connections…" /> : null}
      {sc.statusState === "error" ? <ErrorText>Couldn&apos;t check Search Console right now.</ErrorText> : null}
      {ga.statusState === "error" ? <ErrorText>Couldn&apos;t check Google Analytics right now.</ErrorText> : null}

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

      {ga.status ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Google Analytics</p>
            {ga.status.connected ? (
              <>
                <p className="mt-1 text-sm text-muted">
                  Connected · {ga.status.property_name}
                  {ga.status.website_url ? ` · ${ga.status.website_url.replace(/^https?:\/\//, "")}` : ""}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {ga.status.conversions_measurable
                    ? `Key events: ${ga.status.conversion_events.join(", ")}`
                    : "No key events configured. Organic leads stay not measurable."}
                </p>
                {ga.status.last_sync_error ? <p className="mt-1 text-sm text-danger">{ga.status.last_sync_error}</p> : null}
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Not connected. Organic sessions and leads stay unlabeled until this property is connected.</p>
            )}
          </div>
          {ga.status.connected ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => ga.sync()} loading={ga.isSyncing}>
                Sync now
              </Button>
              <Button variant="danger" onClick={() => ga.disconnect()} loading={ga.isDisconnecting}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={() => ga.connect()}>Connect</Button>
          )}
        </Card>
      ) : null}

      <EmptyState
        title="Other connections are not set up"
        description="Business Profile, WordPress, CRM, and similar sources are not connected in this phase. Organic pipeline stays not connected until a CRM exists."
      />
    </>
  );
}
