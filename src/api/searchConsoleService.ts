import { apiClient } from "./apiClient";
import type { ConnectionStatus, Overview, TopPage, TopQuery } from "@/types/searchConsole";

async function getStatus(businessId: number): Promise<ConnectionStatus> {
  const { data } = await apiClient.get<ConnectionStatus>(`/search-console/${businessId}/status/`);
  return data;
}

/**
 * Fetches the Google authorization URL (an authenticated request, so the
 * backend knows who's connecting) and navigates the whole browser there —
 * this can't be a simple <a href> to the backend, since a raw browser
 * navigation wouldn't carry the Bearer token the backend needs to identify
 * the business/user.
 */
async function connect(businessId: number): Promise<void> {
  const { data } = await apiClient.get<{ url: string }>(`/search-console/${businessId}/authorize-url/`);
  window.location.href = data.url;
}

async function sync(businessId: number): Promise<void> {
  await apiClient.post(`/search-console/${businessId}/sync/`);
}

async function getOverview(businessId: number, rangeDays: number): Promise<Overview> {
  const { data } = await apiClient.get<Overview>(`/search-console/${businessId}/overview/`, { params: { range: rangeDays } });
  return data;
}

async function getTopQueries(businessId: number): Promise<TopQuery[]> {
  const { data } = await apiClient.get<TopQuery[]>(`/search-console/${businessId}/top-queries/`);
  return data;
}

async function getTopPages(businessId: number): Promise<TopPage[]> {
  const { data } = await apiClient.get<TopPage[]>(`/search-console/${businessId}/top-pages/`);
  return data;
}

export const searchConsoleService = { getStatus, connect, sync, getOverview, getTopQueries, getTopPages };
