import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";
import { useSiteHealth } from "@/hooks/useSiteHealth";

export function SiteHealthPage() {
  const { business } = useBusiness();
  const health = useSiteHealth(business.id);
  const report = health.report;

  return (
    <>
      <PageHeader
        eyebrow="Technical SEO"
        title="Site health"
        description="Findings from a crawl of this business website. Scores come from pages we fetched, not from Google's index or a lab performance test."
        action={
          business.website ? (
            <Button onClick={() => health.startCrawl()} loading={health.isStarting || report?.status === "queued" || report?.status === "running"}>
              {report?.status === "completed" ? "Crawl again" : "Crawl site"}
            </Button>
          ) : null
        }
      />

      {health.startError ? <ErrorText>{health.startError}</ErrorText> : null}
      {health.loadState === "error" ? <ErrorText>Couldn't load site health right now.</ErrorText> : null}
      {health.loadState === "loading" || health.loadState === "idle" ? <LoadingState label="Checking the latest crawl…" /> : null}

      {health.loadState === "loaded" && !business.website ? (
        <EmptyState
          title="No website to crawl"
          description={`Add a website for ${business.name} before running a crawl.`}
          action={
            <Link to={`/businesses/${business.id}/settings`} className="text-sm font-medium text-primary hover:text-primary-hover">
              Open settings →
            </Link>
          }
        />
      ) : null}

      {health.loadState === "loaded" && business.website && report?.status === "none" ? (
        <EmptyState
          title="No site health data yet"
          description={`Crawl ${business.website} to record titles, descriptions, and pages that do not load. Nothing is shown until that crawl finishes.`}
        />
      ) : null}

      {report?.status === "failed" ? <ErrorText>The last crawl failed: {report.error || "unknown error"}.</ErrorText> : null}

      {report?.status === "queued" || report?.status === "running" ? <LoadingState label="Crawling the site…" /> : null}

      {report?.status === "completed" ? (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
            <Card>
              <p className="text-xs font-bold uppercase tracking-[0.09em] text-muted">Crawl score</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight">{report.score ?? "—"}</p>
              <p className="mt-1 text-sm text-muted">out of 100</p>
              <p className="mt-3 text-sm text-muted">{report.pages_crawled} pages fetched. Critical issues: {report.critical_issues}.</p>
            </Card>
            <div className="grid gap-3 sm:grid-cols-2">
              {report.categories.map((category) => (
                <Card key={category.label} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{category.label}</p>
                    <span className="text-xs font-semibold text-muted">{category.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-muted">{category.summary}</p>
                </Card>
              ))}
            </div>
          </div>

          {report.findings.length === 0 ? (
            <EmptyState title="No findings in this crawl" description="The pages we fetched loaded and had titles and descriptions." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold">Findings</h2>
                <p className="mt-1 text-sm text-muted">Each row is something present in the crawled HTML or in the HTTP response.</p>
              </div>
              <div className="divide-y divide-border">
                {report.findings.map((finding) => (
                  <article key={`${finding.severity}-${finding.title}-${finding.url}`} className="px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      {finding.severity} · {finding.category}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold">{finding.title}</h3>
                    <p className="mt-1 text-sm text-muted">{finding.detail}</p>
                    {finding.url ? <p className="mt-1 truncate text-xs text-muted">{finding.url}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
