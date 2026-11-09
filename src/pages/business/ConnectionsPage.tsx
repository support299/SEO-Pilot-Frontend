import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState, SuccessText } from "@/components/ui/Feedback";
import { WordPressConnectForm } from "@/components/wordpress/WordPressConnectForm";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";
import { useAuth } from "@/hooks/useAuth";
import { useWordPress } from "@/hooks/useWordPress";

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
  const wp = useWordPress(business.id);
  const { user } = useAuth();
  const publishingOn = wp.status?.connected ? wp.status.publishing_enabled : true;
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
              {business.can_edit ? (
                <Button variant="danger" onClick={() => sc.disconnect()} loading={sc.isDisconnecting}>
                  Disconnect
                </Button>
              ) : null}
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
              {business.can_edit ? (
                <>
                  <Button variant="secondary" onClick={() => ga.sync()} loading={ga.isSyncing}>
                    Sync now
                  </Button>
                  <Button variant="danger" onClick={() => ga.disconnect()} loading={ga.isDisconnecting}>
                    Disconnect
                  </Button>
                </>
              ) : null}
            </div>
          ) : (
            <Button onClick={() => ga.connect()}>Connect</Button>
          )}
        </Card>
      ) : null}

      {wp.statusState === "error" ? <ErrorText>Couldn&apos;t check the WordPress connection right now.</ErrorText> : null}

      {wp.status ? (
        <Card>
          {wp.status.connected ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">WordPress</p>
                  <p className="mt-1 text-sm text-muted">Connected · {wp.status.website_url.replace(/^https?:\/\//, "")} · {wp.status.wp_user_name}</p>
                  {wp.status.last_error ? <p className="mt-1 text-sm text-danger">{wp.status.last_error}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link to={`/businesses/${business.id}/work`} className="text-sm font-medium text-primary hover:text-primary-hover">
                    View Execution →
                  </Link>
                  {business.can_edit ? (
                    <Button variant="danger" onClick={() => wp.disconnect()} loading={wp.isDisconnecting}>
                      Disconnect
                    </Button>
                  ) : null}
                </div>
              </div>
              {business.can_edit ? (
                <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">SEO plugin: {wp.status.seo_plugin_label}</p>
                      <p className="mt-1 text-sm text-muted">
                        {wp.status.seo_plugin
                          ? "Approved title and meta description changes can be published to this site."
                          : "Without All in One SEO, Yoast or Rank Math, published titles and meta descriptions won't change on the page. Install one, then check again."}
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => wp.checkPlugin()} loading={wp.isCheckingPlugin}>
                      Check again
                    </Button>
                  </div>
                  {user?.is_agency_admin ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Publishing: {wp.status.publishing_enabled ? "on" : "off"}</p>
                        <p className="mt-1 text-sm text-muted">
                          {wp.status.publishing_enabled
                            ? "Turn off if this WordPress is only a content store and the live site is built elsewhere."
                            : "This WordPress doesn't control the live site. Findings are tracked; no changes are proposed or published."}
                        </p>
                      </div>
                      <Button variant="secondary" onClick={() => wp.setPublishing(!publishingOn)} loading={wp.isSwitchingPublishing}>
                        {wp.status.publishing_enabled ? "Turn publishing off" : "Turn publishing on"}
                      </Button>
                    </div>
                  ) : !wp.status.publishing_enabled ? (
                    <p className="text-sm text-muted">Publishing is off: this WordPress doesn't control the live site.</p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">WordPress</p>
              <p className="mt-1 mb-4 text-sm text-muted">Not connected. Publishing approved page/post title and meta description changes is unavailable until this is connected.</p>
              {business.can_edit ? <WordPressConnectForm onConnect={wp.connect} /> : <p className="text-sm text-muted">Your SEO team connects WordPress for you.</p>}
            </>
          )}
        </Card>
      ) : null}

      <EmptyState
        title="Other connections are not set up"
        description="Business Profile and CRM sources are not connected in this phase. Organic pipeline stays not connected until a CRM exists."
      />
    </>
  );
}
