import { useEffect, useState } from "react";
import { approvalsService } from "@/api/approvalsService";
import type { Approval, ApprovalDecision } from "@/types/approvals";

type LoadState = "idle" | "loading" | "loaded" | "error";

export function useApprovals(businessId: number) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [decideError, setDecideError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setLoadState("loading");
    approvalsService.list(businessId).then(
      (result) => {
        if (cancelled) return;
        setApprovals(result);
        setLoadState("loaded");
      },
      () => {
        if (!cancelled) setLoadState("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  async function decide(approvalId: number, decision: ApprovalDecision) {
    setWorkingId(approvalId);
    setDecideError(null);
    try {
      const updated = await approvalsService.decide(businessId, approvalId, decision);
      setApprovals((current) => current.map((approval) => (approval.id === updated.id ? updated : approval)));
    } catch {
      setDecideError("Couldn't save that decision. Try again.");
    } finally {
      setWorkingId(null);
    }
  }

  return { approvals, loadState, workingId, decideError, decide };
}
