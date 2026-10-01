export type SiteHealthStatus = "none" | "queued" | "running" | "completed" | "failed";

export type SiteHealthCategory = {
  label: string;
  status: string;
  summary: string;
};

export type SiteHealthFinding = {
  url: string;
  category: string;
  severity: "critical" | "high" | "medium";
  title: string;
  detail: string;
};

export type CrawledPage = {
  url: string;
  status_code: number;
  title: string;
  meta_description: string;
  noindex: boolean;
};

export type SiteHealthReport = {
  status: SiteHealthStatus;
  score: number | null;
  pages_crawled: number;
  critical_issues: number;
  error: string | null;
  seed_url: string | null;
  finished_at: string | null;
  categories: SiteHealthCategory[];
  findings: SiteHealthFinding[];
  pages: CrawledPage[];
};
