export type ApprovalStatus = "pending" | "approved" | "rejected" | "resolved";

export type ApprovalDecision = "pending" | "approved" | "rejected";

export type Approval = {
  id: number;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium";
  detail: string;
  affected_urls: string[];
  status: ApprovalStatus;
  decided_at: string | null;
  created_at: string;
};
