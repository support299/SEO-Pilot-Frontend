import { useEffect, useState } from "react";
import { approvalsService } from "@/api/approvalsService";
import { wordpressService } from "@/api/wordpressService";

/** How many things are waiting on a person: crawl issues and proposed website changes. Refreshes when `refreshKey` changes. */
export function usePendingDecisions(businessId: number, refreshKey: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([approvalsService.list(businessId), wordpressService.listChangePackets(businessId)]).then(([approvals, packets]) => {
      if (cancelled) return;
      const issues = approvals.status === "fulfilled" ? approvals.value.filter((a) => a.status === "pending").length : 0;
      const changes = packets.status === "fulfilled" ? packets.value.filter((p) => p.status === "awaiting_approval" || p.status === "stale").length : 0;
      setCount(issues + changes);
    });
    return () => {
      cancelled = true;
    };
  }, [businessId, refreshKey]);

  return count;
}
