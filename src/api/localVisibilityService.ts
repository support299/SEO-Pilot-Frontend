import { apiClient } from "./apiClient";
import type { KeywordDetail, LocalProfile, LocalVisibilityOverview, ProfileInput } from "@/types/localVisibility";

async function getOverview(businessId: number): Promise<LocalVisibilityOverview> {
  const { data } = await apiClient.get<LocalVisibilityOverview>(`/local-visibility/${businessId}/`);
  return data;
}

async function saveProfile(businessId: number, input: ProfileInput): Promise<LocalProfile> {
  const { data } = await apiClient.put<LocalProfile>(`/local-visibility/${businessId}/profile/`, input);
  return data;
}

async function addKeyword(businessId: number, keyword: string): Promise<{ id: number; keyword: string }> {
  const { data } = await apiClient.post<{ id: number; keyword: string }>(`/local-visibility/${businessId}/keywords/`, { keyword });
  return data;
}

async function removeKeyword(businessId: number, keywordId: number): Promise<void> {
  await apiClient.delete(`/local-visibility/${businessId}/keywords/${keywordId}/`);
}

async function getKeyword(businessId: number, keywordId: number): Promise<KeywordDetail> {
  const { data } = await apiClient.get<KeywordDetail>(`/local-visibility/${businessId}/keywords/${keywordId}/`);
  return data;
}

async function startScan(businessId: number, keywordId: number): Promise<void> {
  await apiClient.post(`/local-visibility/${businessId}/keywords/${keywordId}/scan/`);
}

export const localVisibilityService = { getOverview, saveProfile, addKeyword, removeKeyword, getKeyword, startScan };
