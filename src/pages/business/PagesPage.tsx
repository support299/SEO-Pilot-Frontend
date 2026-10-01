import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ColumnHint } from "@/components/ui/ColumnHint";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";
import { useSearchConsole } from "@/hooks/useSearchConsole";
import { useSiteHealth } from "@/hooks/useSiteHealth";
import type { SiteHealthFinding } from "@/types/siteHealth";
import type { TopPage } from "@/types/searchConsole";

export function PagesPage() {
  const { business } = useBusiness();
  const health = useSiteHealth(business.id);
  const sc = useSearchConsole(business.id);
  const report = health.report;
  const completed = report?.status === "completed";
  const pages = completed ? (report.pages ?? []) : [];
  const findingsByUrl = groupFindings(completed ? report.findings : []);
  const metricsByUrl = indexTopPages(sc.status?.connected ? sc.topPages : null);

  return (
    <>
      <PageHeader
        eyebrow="Content & pages"
        title="Pages"
        description="URLs found by the latest completed crawl of this website. Clicks, impressions, and position appear only when that same URL is in the Search Console top-pages snapshot."
      />

      {health.loadState === "error" ? <ErrorText>Couldn&apos;t load the crawl inventory right now.</ErrorText> : null}
      {health.loadState === "loading" || health.loadState === "idle" ? <LoadingState label="Checking the latest crawl…" /> : null}

      {health.loadState === "loaded" && !completed ? (
        <EmptyState
          title="No crawl has finished"
          description={`Pages for ${business.name} appear after a crawl finishes. Nothing is listed until Site Health has a completed crawl.`}
          action={
            <Link to={`/businesses/${business.id}/site-health`} className="text-sm font-medium text-primary hover:text-primary-hover">
              Open Site Health →
            </Link>
          }
        />
      ) : null}

      {completed ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">{pages.length} pages found by the crawl</h2>
            <p className="mt-1 text-sm text-muted">These are pages the crawl fetched. This is not Google&apos;s indexed-page count.</p>
          </div>
          {pages.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted">The latest crawl finished and did not save any pages.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-240 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="px-5 py-3 font-medium">URL</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Title</th>
                    <th className="px-3 py-3 font-medium">Meta description</th>
                    <th className="px-3 py-3 font-medium">Noindex</th>
                    <th className="px-3 py-3 text-right font-medium">Clicks</th>
                    <th className="px-3 py-3 text-right font-medium">
                      <ColumnHint label="Impressions" hint="How many times this URL showed up in Google search results. Blank when it is not in the Search Console top-pages snapshot." />
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      <ColumnHint label="Position" hint="Average place in those Google results. 1 is the top result. A higher number means it usually appeared further down. Blank when Search Console has no row for this URL." />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => {
                    const metrics = metricsByUrl.get(pageKey(page.url));
                    const findings = findingsByUrl.get(page.url) ?? [];
                    return (
                      <tr key={page.url} className="border-b border-border/60 align-top last:border-0">
                        <td className="max-w-70 px-5 py-3">
                          <p className="truncate text-foreground" title={page.url}>
                            {page.url}
                          </p>
                          {findings.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                              {findings.map((finding) => (
                                <li key={`${finding.severity}-${finding.title}`} className="text-xs leading-5 text-muted">
                                  {finding.title}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 tabular-nums text-foreground">{page.status_code}</td>
                        <td className="max-w-45 px-3 py-3">
                          <p className="truncate" title={page.title}>
                            {page.title}
                          </p>
                        </td>
                        <td className="max-w-60 px-3 py-3 text-muted">
                          <p className="truncate" title={page.meta_description}>
                            {page.meta_description}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-muted">{page.noindex ? "Yes" : "No"}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{metrics ? metrics.clicks.toLocaleString("en-US") : ""}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted">{metrics ? metrics.impressions.toLocaleString("en-US") : ""}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted">{metrics ? metrics.position.toFixed(1) : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}

function groupFindings(findings: SiteHealthFinding[]) {
  const grouped = new Map<string, SiteHealthFinding[]>();
  for (const finding of findings) {
    if (!finding.url) continue;
    const rows = grouped.get(finding.url) ?? [];
    rows.push(finding);
    grouped.set(finding.url, rows);
  }
  return grouped;
}

function indexTopPages(pages: TopPage[] | null) {
  const indexed = new Map<string, TopPage>();
  for (const page of pages ?? []) {
    indexed.set(pageKey(page.page), page);
  }
  return indexed;
}

function pageKey(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    let path = parsed.pathname || "/";
    if (path !== "/" && path.endsWith("/")) path = path.slice(0, -1);
    return `${parsed.protocol}//${host}${path}${parsed.search}`;
  } catch {
    return url.trim();
  }
}
