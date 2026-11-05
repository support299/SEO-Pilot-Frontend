import { useCallback, useEffect, useState } from "react";
import { planService } from "@/api/planService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorText } from "@/components/ui/Feedback";
import { TextInput } from "@/components/ui/Field";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/types/api";
import { PACKAGE_OPTIONS, type PackageKey, type Plan, type ScopeRequest, type StaffPlanChange } from "@/types/plan";

const selectClass = "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary";

/** Agency admins only: decide scope requests and record package changes. Never rendered for customers. */
export function PlanStaffPanel({ businessId, plan, onChanged }: { businessId: number; plan: Plan; onChanged: () => void }) {
  const toast = useToast();
  const [requests, setRequests] = useState<ScopeRequest[]>([]);
  const [changes, setChanges] = useState<StaffPlanChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPackage, setNewPackage] = useState<PackageKey | "">("");
  const [noticeDate, setNoticeDate] = useState("");
  const [effectiveDates, setEffectiveDates] = useState<Record<number, string>>({});

  const reload = useCallback(async () => {
    try {
      const [scope, plans] = await Promise.all([planService.listScopeRequests(businessId), planService.listPlanChanges(businessId)]);
      setRequests(scope);
      setChanges(plans);
      setError(null);
    } catch {
      setError("Couldn't load requests.");
    }
  }, [businessId]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    reload();
  }, [reload]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      toast.show("success", success);
      await reload();
      onChanged();
    } catch (err) {
      toast.show("error", errorMessage(err, "That didn't work. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  const openRequests = requests.filter((r) => r.status === "open");
  const openChange = changes.find((c) => c.status === "pending" || c.status === "confirmed");
  const otherPackages = PACKAGE_OPTIONS.filter((option) => option.value !== plan.package);

  return (
    <Card className="mt-4 border-primary/30">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Staff only</p>
      {error ? <ErrorText>{error}</ErrorText> : null}

      <h2 className="mt-3 text-sm font-semibold text-foreground">Scope requests</h2>
      {openRequests.length === 0 ? <p className="mt-1 text-sm text-muted">No open requests.</p> : null}
      <ul className="mt-2 divide-y divide-border">
        {openRequests.map((request) => (
          <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{request.capability_label}</p>
              <p className="text-xs text-muted">
                {request.requested_by ?? "Unknown"} · {new Date(request.created_at).toLocaleDateString()}
              </p>
              {request.note ? <p className="mt-1 text-xs text-foreground">{request.note}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={busy} onClick={() => run(() => planService.decideScope(businessId, request.id, { decision: "approve", grant: true }), "Approved and added to this website's scope.")}>
                Approve and add
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => run(() => planService.decideScope(businessId, request.id, { decision: "approve" }), "Approved. Nothing was added to the scope.")}>
                Approve only
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => run(() => planService.decideScope(businessId, request.id, { decision: "decline" }), "Declined.")}>
                Decline
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-muted">&quot;Approve only&quot; records the decision. &quot;Approve and add&quot; also makes it included for this website. Neither bills anything.</p>

      <h2 className="mt-6 text-sm font-semibold text-foreground">Package change</h2>
      {openChange ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background p-3">
          <div>
            <p className="text-sm text-foreground">
              To <strong>{openChange.requested_package_label}</strong> · notice received {new Date(openChange.notice_received_at).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted">
              {openChange.status === "confirmed" ? `Confirmed for ${openChange.confirmed_effective_on}` : "Effective date awaiting confirmation"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {openChange.status === "pending" ? (
              <>
                <TextInput
                  type="date"
                  aria-label="Confirmed effective date"
                  value={effectiveDates[openChange.id] ?? ""}
                  onChange={(e) => setEffectiveDates({ ...effectiveDates, [openChange.id]: e.target.value })}
                  className="!w-auto !py-1.5"
                />
                <Button
                  disabled={busy || !effectiveDates[openChange.id]}
                  onClick={() => run(() => planService.actOnPlanChange(businessId, openChange.id, { action: "confirm", effective_on: effectiveDates[openChange.id] ?? "" }), "Effective date confirmed.")}
                >
                  Confirm date
                </Button>
              </>
            ) : null}
            <Button variant="secondary" disabled={busy} onClick={() => run(() => planService.actOnPlanChange(businessId, openChange.id, { action: "cancel" }), "Package change cancelled.")}>
              Cancel change
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Requested package
            <select className={selectClass} value={newPackage} onChange={(e) => setNewPackage(e.target.value as PackageKey | "")}>
              <option value="">Choose…</option>
              {otherPackages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Written notice received
            <TextInput type="date" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} className="!w-auto !py-1.5" />
          </label>
          <Button
            disabled={busy || !newPackage}
            onClick={() =>
              run(
                () => planService.recordPlanChange(businessId, { requested_package: newPackage as PackageKey, notice_received_at: noticeDate ? new Date(`${noticeDate}T12:00:00`).toISOString() : undefined }),
                "Recorded. Effective date awaiting confirmation.",
              )
            }
          >
            Record change
          </Button>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">No date or proration is calculated. Confirm the effective date yourself once it's agreed in writing.</p>
    </Card>
  );
}
