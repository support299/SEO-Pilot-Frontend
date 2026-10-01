import { apiClient } from "./apiClient";
import type { SiteHealthReport } from "@/types/siteHealth";

async function getReport(businessId: number): Promise<SiteHealthReport> {
  const { data } = await apiClient.get<SiteHealthReport>(`/site-health/${businessId}/`);
  return data;
}

async function startCrawl(businessId: number): Promise<void> {
  await apiClient.post(`/site-health/${businessId}/crawl/`);
}

export const siteHealthService = { getReport, startCrawl };
