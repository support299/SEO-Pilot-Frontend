import { useEffect, useState } from "react";
import { approvalsService } from "@/api/approvalsService";
import { planService } from "@/api/planService";
import { sitePlanService } from "@/api/sitePlanService";
import { wordpressService } from "@/api/wordpressService";

/**
 * How many things are waiting on a person: crawl issues, proposed website changes, site plans submitted by an agent,
 * and open scope requests. `section` is where the badge should take you (the first kind that has something waiting).
 * Refreshes when `refreshKey` changes.
 */
export function usePendingDecisions(businessId: number, refreshKey: string) {
  const [pending, setPending] = useState({ count: 0, section: "approvals" });

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      approvalsService.list(businessId),
      wordpressService.listChangePackets(businessId),
      sitePlanService.get(businessId),
      planService.listScopeRequests(businessId),
    ]).then(([approvals, packets, plans, scope]) => {
      if (cancelled) return;
      const issues = approvals.status === "fulfilled" ? approvals.value.filter((a) => a.status === "pending").length : 0;
      const changes = packets.status === "fulfilled" ? packets.value.filter((p) => p.status === "awaiting_approval" || p.status === "stale").length : 0;
      const planWaiting = plans.status === "fulfilled" && plans.value.open?.status === "submitted" ? 1 : 0;
      const scopeOpen = scope.status === "fulfilled" ? scope.value.filter((r) => r.status === "open").length : 0;
      const section = issues + changes > 0 ? "approvals" : planWaiting ? "work-plan" : scopeOpen ? "plan" : "approvals";
      setPending({ count: issues + changes + planWaiting + scopeOpen, section });
    });
    return () => {
      cancelled = true;
    };
  }, [businessId, refreshKey]);

  return pending;
}
