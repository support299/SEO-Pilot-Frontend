import { apiClient } from "./apiClient";
import type { HistoryPage } from "@/types/history";

async function getPage(businessId: number, page: number): Promise<HistoryPage> {
  const { data } = await apiClient.get<HistoryPage>(`/history/${businessId}/`, { params: { page } });
  return data;
}

export const historyService = { getPage };
