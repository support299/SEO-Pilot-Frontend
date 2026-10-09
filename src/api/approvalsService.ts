import { apiClient } from "./apiClient";
import type { Approval, ApprovalDecision } from "@/types/approvals";

async function list(businessId: number): Promise<Approval[]> {
  const { data } = await apiClient.get<{ approvals: Approval[] }>(`/approvals/${businessId}/`);
  return data.approvals;
}

async function decide(businessId: number, approvalId: number, decision: ApprovalDecision): Promise<Approval> {
  const { data } = await apiClient.post<Approval>(`/approvals/${businessId}/${approvalId}/decision/`, { decision });
  return data;
}

export const approvalsService = { list, decide };
