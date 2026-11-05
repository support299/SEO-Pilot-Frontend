export type PlanStatus = "draft" | "submitted" | "active" | "superseded" | "rejected" | "withdrawn";
export type TaskStatus = "planned" | "in_progress" | "waiting" | "done" | "deferred" | "cancelled";

export type PlanTask = {
  id: number;
  feature_id: string;
  feature_title: string;
  title: string;
  description: string;
  target: string;
  priority: "low" | "medium" | "high";
  completion_criteria: string;
  planned_start: string | null;
  planned_end: string | null;
  status: TaskStatus;
  status_note: string;
  // staff only
  risk?: "low" | "medium" | "high";
  scope_justification?: string;
  estimate_minutes?: number | null;
  completion_evidence?: string;
  updated_by_agent?: string;
  eligibility?: { ok: boolean; code: string; conditional: boolean };
};

export type SitePlan = {
  id: number;
  version: number;
  status: PlanStatus;
  summary: string;
  effective_from: string | null;
  reassess_on: string | null;
  tasks: PlanTask[];
  // staff only
  created_by?: string | null;
  submitted_at?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  decision_note?: string;
  estimate_minutes_total?: number;
};

export type SitePlanWorkspace = {
  active: SitePlan | null;
  open?: SitePlan | null;
  history?: { id: number; version: number; status: PlanStatus; decided_at: string | null; decision_note: string }[];
};
