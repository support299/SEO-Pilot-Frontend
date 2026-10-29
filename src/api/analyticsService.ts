import { apiClient } from "./apiClient";
import { isEmbedded, openGooglePopup } from "./googlePopup";
import type { AnalyticsConnectionStatus, AnalyticsOverview } from "@/types/analytics";

async function getStatus(businessId: number): Promise<AnalyticsConnectionStatus> {
  const { data } = await apiClient.get<AnalyticsConnectionStatus>(`/analytics/${businessId}/status/`);
  return data;
}

async function connect(businessId: number): Promise<"popup" | "redirect"> {
  const embedded = isEmbedded();
  const { data } = await apiClient.get<{ url: string }>(`/analytics/${businessId}/authorize-url/`, { params: embedded ? { popup: 1 } : undefined });
  if (embedded && openGooglePopup(data.url)) return "popup";
  window.location.href = data.url;
  return "redirect";
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
