import { apiClient } from "./apiClient";
import type { Benefit, ChecklistChange, ChecklistData, ChecklistRow, ChecklistStatus, PackageKey, Plan, ScopeRequest, StaffPlanChange } from "@/types/plan";

async function get(businessId: number): Promise<Plan> {
  const { data } = await apiClient.get<Plan>(`/businesses/${businessId}/plan/`);
  return data;
}

/** Agency admins only: record or change the package a website has paid for. */
async function setPackage(businessId: number, pkg: PackageKey): Promise<Plan> {
  const { data } = await apiClient.put<Plan>(`/businesses/${businessId}/subscription/`, { package: pkg, status: "active" });
  return data;
}

async function listScopeRequests(businessId: number): Promise<ScopeRequest[]> {
  const { data } = await apiClient.get<ScopeRequest[]>(`/businesses/${businessId}/scope-requests/`);
  return data;
}

/** Anyone with access to the website, including read-only customers, may ask. It records a request; it starts no work. */
async function requestScope(businessId: number, capability: string, note?: string): Promise<ScopeRequest> {
  const { data } = await apiClient.post<ScopeRequest>(`/businesses/${businessId}/scope-requests/`, { capability, note });
  return data;
}

async function decideScope(businessId: number, requestId: number, input: { decision: "approve" | "decline"; grant?: boolean; decision_note?: string }): Promise<ScopeRequest> {
  const { data } = await apiClient.post<ScopeRequest>(`/businesses/${businessId}/scope-requests/${requestId}/decision/`, input);
  return data;
}

async function listPlanChanges(businessId: number): Promise<StaffPlanChange[]> {
  const { data } = await apiClient.get<StaffPlanChange[]>(`/businesses/${businessId}/plan-changes/`);
  return data;
}

async function recordPlanChange(businessId: number, input: { requested_package: PackageKey; notice_received_at?: string; requested_effective_on?: string | null; note?: string }): Promise<StaffPlanChange> {
  const { data } = await apiClient.post<StaffPlanChange>(`/businesses/${businessId}/plan-changes/`, input);
  return data;
}

async function actOnPlanChange(businessId: number, changeId: number, input: { action: "confirm"; effective_on: string } | { action: "cancel" }): Promise<StaffPlanChange> {
  const { data } = await apiClient.post<StaffPlanChange>(`/businesses/${businessId}/plan-changes/${changeId}/`, input);
  return data;
}

async function listBenefits(businessId: number): Promise<Benefit[]> {
  const { data } = await apiClient.get<Benefit[]>(`/businesses/${businessId}/benefits/`);
  return data;
}

export type BenefitDecisionInput = {
  decision: "accepted" | "declined" | "revoked";
  consented_by_name?: string;
  evidence?: string;
  terms_accepted?: boolean;
  terms_reference?: string;
  workflow_authority_confirmed?: boolean;
  recurring_charge_acknowledged?: boolean;
  note?: string;
};

/** Agency admins only: record what the customer decided, with the evidence. */
async function decideBenefit(businessId: number, benefit: string, input: BenefitDecisionInput): Promise<Benefit[]> {
  const { data } = await apiClient.post<Benefit[]>(`/businesses/${businessId}/benefits/${benefit}/`, input);
  return data;
}

async function getChecklist(businessId: number): Promise<ChecklistData> {
  const { data } = await apiClient.get<ChecklistData>(`/businesses/${businessId}/checklist/`);
  return data;
}

export type ChecklistUpdateInput = { status: ChecklistStatus; finding?: string; evidence?: string; owner?: string; next_action?: string; blocker?: string; reason?: string };

async function updateChecklistItem(businessId: number, featureId: string, input: ChecklistUpdateInput): Promise<ChecklistRow> {
  const { data } = await apiClient.put<ChecklistRow>(`/businesses/${businessId}/checklist/${featureId}/`, input);
  return data;
}

async function checklistHistory(businessId: number, featureId: string): Promise<ChecklistChange[]> {
  const { data } = await apiClient.get<ChecklistChange[]>(`/businesses/${businessId}/checklist/${featureId}/`);
  return data;
}

export const planService = { listBenefits, decideBenefit, getChecklist, updateChecklistItem, checklistHistory, get, setPackage, listScopeRequests, requestScope, decideScope, listPlanChanges, recordPlanChange, actOnPlanChange };
