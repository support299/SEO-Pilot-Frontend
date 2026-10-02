import { apiClient } from "./apiClient";
import type { AnalyticsConnectionStatus, AnalyticsOverview } from "@/types/analytics";

async function getStatus(businessId: number): Promise<AnalyticsConnectionStatus> {
  const { data } = await apiClient.get<AnalyticsConnectionStatus>(`/analytics/${businessId}/status/`);
  return data;
}

async function connect(businessId: number): Promise<void> {
  const { data } = await apiClient.get<{ url: string }>(`/analytics/${businessId}/authorize-url/`);
  window.location.href = data.url;
}

async function sync(businessId: number): Promise<void> {
  await apiClient.post(`/analytics/${businessId}/sync/`);
}

async function disconnect(businessId: number): Promise<void> {
  await apiClient.post(`/analytics/${businessId}/disconnect/`);
}

async function getOverview(businessId: number, rangeDays: number): Promise<AnalyticsOverview> {
  const { data } = await apiClient.get<AnalyticsOverview>(`/analytics/${businessId}/overview/`, { params: { range: rangeDays } });
  return data;
}

export const analyticsService = { getStatus, connect, sync, disconnect, getOverview };
