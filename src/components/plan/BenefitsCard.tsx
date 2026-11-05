import { useCallback, useEffect, useState } from "react";
import { planService, type BenefitDecisionInput } from "@/api/planService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorText } from "@/components/ui/Feedback";
import { TextInput } from "@/components/ui/Field";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/types/api";
import type { Benefit, BenefitState } from "@/types/plan";

const STATE_LABEL: Record<BenefitState, string> = { off: "Off", on: "On", declined: "Declined", revoked: "Turned off" };
const STATE_STYLE: Record<BenefitState, string> = {
  off: "bg-black/5 text-muted",
  on: "bg-emerald-100 text-emerald-800",
  declined: "bg-black/5 text-muted",
  revoked: "bg-amber-100 text-amber-800",
};

/** Optional benefits. Nothing is ever on or pre-selected until the customer's own yes is recorded. */
export function BenefitsCard({ businessId, isStaff, onChanged }: { businessId: number; isStaff: boolean; onChanged: () => void }) {
  const [benefits, setBenefits] = useState<Benefit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setBenefits(await planService.listBenefits(businessId));
      setError(null);
    } catch {
      setError("Couldn't load your optional benefits.");
    }
  }, [businessId]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load();
  }, [load]);

  return (
    <Card className="mt-4">
      <h2 className="text-sm font-semibold text-foreground">Optional benefits</h2>
      <p className="mt-1 text-xs text-muted">These are always your choice. Saying no never affects your SEO service.</p>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <ul className="mt-3 divide-y divide-border">
        {benefits?.map((benefit) => (
          <BenefitRow key={benefit.key} benefit={benefit} businessId={businessId} isStaff={isStaff} onSaved={() => { load(); onChanged(); }} />
        ))}
      </ul>
    </Card>
  );
}

function BenefitRow({ benefit, businessId, isStaff, onSaved }: { benefit: Benefit; businessId: number; isStaff: boolean; onSaved: () => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<"" | "accepted" | "declined" | "revoked">(""); // never pre-selected
  const [name, setName] = useState("");
  const [evidence, setEvidence] = useState("");
  const [terms, setTerms] = useState(false);
  const [termsRef, setTermsRef] = useState("");
  const [authority, setAuthority] = useState(false);
  const [chargeAck, setChargeAck] = useState(false);
  const [saving, setSaving] = useState(false);

  const isReputation = benefit.key === "reputation";
  const isAfterCancel = benefit.key === "hosting_after_cancellation";
  const choices: { value: "accepted" | "declined" | "revoked"; label: string }[] =
    benefit.state === "on"
      ? [{ value: "revoked", label: "Turn off" }]
      : [
          { value: "accepted", label: isAfterCancel ? "Yes, start hosting-only ($12 per month)" : "Yes, turn it on" },
          { value: "declined", label: benefit.key === "hosting" ? "No, keep my current host" : "No thanks" },
        ];

  async function save() {
    if (!decision) return;
    setSaving(true);
    const input: BenefitDecisionInput = { decision };
    if (decision === "accepted") {
      Object.assign(input, { consented_by_name: name, evidence, terms_accepted: terms, terms_reference: termsRef, workflow_authority_confirmed: authority, recurring_charge_acknowledged: chargeAck });
    }
    try {
      await planService.decideBenefit(businessId, benefit.key, input);
      toast.show("success", "Recorded.");
      setOpen(false);
      setDecision("");
      onSaved();
    } catch (err) {
      toast.show("error", errorMessage(err, "Couldn't record that. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="py-3" data-testid={`benefit-${benefit.key}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{benefit.label}</p>
          <p className="mt-0.5 text-xs text-muted">{benefit.description}</p>
          {isStaff && benefit.consented_by_name ? (
            <p className="mt-1 text-xs text-muted">
              Recorded by {benefit.recorded_by ?? "unknown"} for {benefit.consented_by_name}. Evidence: {benefit.evidence}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATE_STYLE[benefit.state]}`}>{STATE_LABEL[benefit.state]}</span>
          {isStaff ? (
            <Button variant="secondary" onClick={() => setOpen(!open)}>
              {open ? "Close" : "Record decision"}
            </Button>
          ) : null}
        </div>
      </div>

      {isStaff && open ? (
        <div className="mt-3 flex flex-col gap-3 rounded-lg bg-background p-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-medium text-muted">What did the customer decide?</legend>
            {choices.map((choice) => (
              <label key={choice.value} className="flex items-center gap-2 text-sm text-foreground">
                <input type="radio" name={`decision-${benefit.key}`} checked={decision === choice.value} onChange={() => setDecision(choice.value)} />
                {choice.label}
              </label>
            ))}
          </fieldset>
          {decision === "accepted" ? (
            <>
              <TextInput aria-label="Who agreed" placeholder="Who agreed (customer's name)" value={name} onChange={(e) => setName(e.target.value)} />
              <TextInput aria-label="Evidence" placeholder="Where and when (e.g. email, 3 Nov)" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
              {isReputation ? (
                <>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> The customer accepted the usage terms
                  </label>
                  <TextInput aria-label="Which terms" placeholder="Which terms (name or link)" value={termsRef} onChange={(e) => setTermsRef(e.target.value)} />
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={authority} onChange={(e) => setAuthority(e.target.checked)} /> This person has authority to approve the review process
                  </label>
                </>
              ) : null}
              {isAfterCancel ? (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={chargeAck} onChange={(e) => setChargeAck(e.target.checked)} /> The customer acknowledged the $12 monthly charge
                </label>
              ) : null}
            </>
          ) : null}
          <div>
            <Button onClick={save} loading={saving} disabled={!decision}>
              Save decision
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
