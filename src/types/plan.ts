export type PackageKey = "starter" | "growth" | "authority";
export type SubscriptionStatus = "none" | "active" | "pending" | "cancelled";
export type CapabilityLevel = "included" | "conditional" | "optional" | "not_included";

export const PACKAGE_OPTIONS: { value: PackageKey; label: string }[] = [
  { value: "starter", label: "Starter Local SEO" },
  { value: "growth", label: "Growth SEO + Content" },
  { value: "authority", label: "Authority SEO Partner" },
];

export type PlanCapability = {
  key: string;
  label: string;
  seo_ids: string[];
  level: CapabilityLevel;
  note: string;
};

export type PendingPlanChange = {
  id: number;
  requested_package: PackageKey;
  requested_package_label: string;
  effective_on: string | null;
  effective_date_label: string;
};

export type ScopeRequest = {
  id: number;
  capability: string;
  capability_label: string;
  status: "open" | "approved" | "declined";
  note: string;
  decision_note: string;
  created_at: string;
  decided_at: string | null;
  requested_by?: string | null;
};

export type StaffPlanChange = {
  id: number;
  from_package: PackageKey;
  requested_package: PackageKey;
  requested_package_label: string;
  status: "pending" | "confirmed" | "applied" | "cancelled";
  notice_received_at: string;
  requested_effective_on: string | null;
  confirmed_effective_on: string | null;
  note: string;
};

export type Plan = {
  pending_change: PendingPlanChange | null;
  subscribed: boolean;
  package: PackageKey | null;
  package_label: string | null;
  status: SubscriptionStatus;
  monthly_price_usd: number | null;
  started_on: string | null;
  capabilities: PlanCapability[];
};

export type BenefitState = "off" | "on" | "declined" | "revoked";

export type Benefit = {
  key: "hosting" | "reputation" | "hosting_after_cancellation";
  label: string;
  description: string;
  state: BenefitState;
  decided_on: string | null;
  consented_by_name?: string;
  evidence?: string;
  recorded_by?: string | null;
};

export type ChecklistStatus = "not_checked" | "verified" | "needs_work" | "in_progress" | "blocked" | "done" | "n_a" | "out_of_package";

export type ChecklistRow = {
  feature_id: string;
  version: string;
  category: string;
  title: string;
  eligibility: "I" | "C" | "A" | "N" | "X" | null;
  eligibility_label: string;
  status: ChecklistStatus;
  finding: string;
  owner: string;
  next_action: string;
  blocker: string;
  last_checked_at: string | null;
  /** "crawl" when filled in automatically by the latest site crawl. */
  source: string;
  evidence?: string;
  prerequisites?: string;
  policy_notes?: string;
};

export type ChecklistData = {
  loaded: boolean;
  package: PackageKey | null;
  summary: Record<ChecklistStatus, number>;
  total: number;
  rows: ChecklistRow[];
};

export type ChecklistChange = { from_status: string; to_status: string; reason: string; evidence: string; actor: string | null; occurred_at: string };
