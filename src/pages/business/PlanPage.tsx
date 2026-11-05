import { useCallback, useEffect, useState } from "react";
import { planService } from "@/api/planService";
import { PageHeader } from "@/components/layout/PageHeader";
import { BenefitsCard } from "@/components/plan/BenefitsCard";
import { PlanStaffPanel } from "@/components/plan/PlanStaffPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/types/api";
import type { CapabilityLevel, Plan, ScopeRequest } from "@/types/plan";

const LEVEL_LABEL: Record<CapabilityLevel, string> = {
  included: "Included",
  conditional: "Conditional",
  optional: "Optional",
  not_included: "Not in this package",
};

const LEVEL_STYLE: Record<CapabilityLevel, string> = {
  included: "bg-emerald-100 text-emerald-800",
  conditional: "bg-amber-100 text-amber-800",
  optional: "bg-sky-100 text-sky-800",
  not_included: "bg-black/5 text-muted",
};

export function PlanPage() {
  const { business } = useBusiness();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [requests, setRequests] = useState<ScopeRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null);
  const { user } = useAuth();
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      const [planData, requestData] = await Promise.all([planService.get(business.id), planService.listScopeRequests(business.id)]);
      setPlan(planData);
      setRequests(requestData);
      setError(null);
    } catch {
      setError("Couldn't load the plan right now.");
    }
  }, [business.id]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load();
  }, [load]);

  async function handleRequest(capabilityKey: string) {
    setRequesting(capabilityKey);
    try {
      await planService.requestScope(business.id, capabilityKey);
      toast.show("success", "Request sent. Nothing starts or is charged until it is approved.");
      await load();
    } catch (err) {
      toast.show("error", errorMessage(err, "Couldn't send the request. Please try again."));
    } finally {
      setRequesting(null);
    }
  }

  const openRequestKeys = new Set(requests.filter((r) => r.status === "open").map((r) => r.capability));

  return (
    <>
      <PageHeader eyebrow="Plan" title="Your package" description="What is included for this website, and what depends on scope, access or your approval." />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {!plan && !error ? <LoadingState label="Loading plan…" /> : null}
      {plan && plan.status === "none" ? (
        <EmptyState title="No package recorded yet" description="A package hasn't been set for this website. Contact your account manager if you expected one." />
      ) : null}
      {plan && plan.status !== "none" ? (
        <>
          <Card className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Package</p>
              <p className="text-xl font-semibold text-foreground">{plan.package_label}</p>
              {plan.status !== "active" ? <p className="mt-1 text-xs font-semibold capitalize text-amber-800">{plan.status}</p> : null}
            </div>
            {plan.monthly_price_usd !== null ? (
              <p className="text-lg font-semibold text-foreground">
                ${plan.monthly_price_usd.toLocaleString()}
                <span className="text-sm font-normal text-muted"> / month</span>
              </p>
            ) : null}
          </Card>
          {plan.pending_change ? (
            <Card className="mt-4 border-amber-300 bg-amber-50">
              <p className="text-sm font-medium text-amber-900">
                Package change requested: {plan.pending_change.requested_package_label}
              </p>
              <p className="mt-0.5 text-xs text-amber-900">
                {plan.pending_change.effective_on ? `Takes effect ${plan.pending_change.effective_on}.` : plan.pending_change.effective_date_label}
              </p>
            </Card>
          ) : null}
          <Card className="mt-4">
            <ul className="divide-y divide-border">
              {plan.capabilities.map((capability) => (
                <li key={capability.key} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{capability.label}</p>
                    {capability.note ? <p className="mt-0.5 text-xs text-muted">{capability.note}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {(capability.level === "not_included" || capability.level === "conditional") && plan.subscribed ? (
                      openRequestKeys.has(capability.key) ? (
                        <span className="text-xs font-medium text-muted">Requested</span>
                      ) : (
                        <Button variant="secondary" loading={requesting === capability.key} onClick={() => handleRequest(capability.key)}>
                          Request this
                        </Button>
                      )
                    ) : null}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[capability.level]}`}>{LEVEL_LABEL[capability.level]}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Availability also depends on access, applicability and your approved site plan. Results such as rankings, traffic or published links are never guaranteed.
            </p>
          </Card>
          <BenefitsCard businessId={business.id} isStaff={Boolean(user?.is_agency_admin)} onChanged={load} />
          {user?.is_agency_admin ? <PlanStaffPanel businessId={business.id} plan={plan} onChanged={load} /> : null}
        </>
      ) : null}
    </>
  );
}
