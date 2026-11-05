import { apiClient } from "./apiClient";
import type { PlanTask, SitePlanWorkspace, TaskStatus } from "@/types/sitePlan";

async function get(businessId: number): Promise<SitePlanWorkspace> {
  const { data } = await apiClient.get<SitePlanWorkspace>(`/businesses/${businessId}/site-plans/`);
  return data;
}

/** Agency admins only. Plans are drafted by the AI agents through the agent API; people decide here. */
async function decide(businessId: number, planId: number, decision: "approve" | "request_changes" | "reject", note?: string): Promise<SitePlanWorkspace> {
  const { data } = await apiClient.post<SitePlanWorkspace>(`/businesses/${businessId}/site-plans/${planId}/decision/`, { decision, note });
  return data;
}

async function recordProgress(businessId: number, taskId: number, input: { status: TaskStatus; status_note?: string; completion_evidence?: string }): Promise<PlanTask> {
  const { data } = await apiClient.patch<PlanTask>(`/businesses/${businessId}/site-plans/tasks/${taskId}/`, input);
  return data;
}

export const sitePlanService = { get, decide, recordProgress };
