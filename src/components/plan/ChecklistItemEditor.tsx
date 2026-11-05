import { useState } from "react";
import { planService } from "@/api/planService";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/types/api";
import type { ChecklistRow, ChecklistStatus } from "@/types/plan";

const STATUS_CHOICES: { value: ChecklistStatus; label: string }[] = [
  { value: "not_checked", label: "Not checked" },
  { value: "verified", label: "Checked (record what was found)" },
  { value: "needs_work", label: "Needs work" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
  { value: "n_a", label: "Not applicable" },
  { value: "out_of_package", label: "Outside the package" },
];

/** Staff only. The server enforces the rules (a finding for "checked", proof for "done", details for "blocked"). */
export function ChecklistItemEditor({ businessId, row, onSaved }: { businessId: number; row: ChecklistRow; onSaved: () => void }) {
  const toast = useToast();
  const [status, setStatus] = useState<ChecklistStatus>(row.status);
  const [finding, setFinding] = useState(row.finding);
  const [evidence, setEvidence] = useState(row.evidence ?? "");
  const [owner, setOwner] = useState(row.owner);
  const [nextAction, setNextAction] = useState(row.next_action);
  const [blocker, setBlocker] = useState(row.blocker);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await planService.updateChecklistItem(businessId, row.feature_id, { status, finding, evidence, owner, next_action: nextAction, blocker, reason });
      toast.show("success", `${row.feature_id} updated.`);
      onSaved();
    } catch (err) {
      toast.show("error", errorMessage(err, "Couldn't save. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-lg border border-primary/30 p-3" data-testid={`editor-${row.feature_id}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Staff only</p>
      <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as ChecklistStatus)} className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm">
        {STATUS_CHOICES.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
      <TextInput aria-label="What was found" placeholder="What was found (shown to the customer)" value={finding} onChange={(e) => setFinding(e.target.value)} />
      <TextInput aria-label="Evidence" placeholder="Proof or link (staff only)" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
      <TextInput aria-label="Owner" placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
      <TextInput aria-label="Next action" placeholder="Next action" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
      {status === "blocked" ? <TextInput aria-label="Blocker" placeholder="What is blocking it" value={blocker} onChange={(e) => setBlocker(e.target.value)} /> : null}
      <TextInput aria-label="Reason for change" placeholder="Reason for this change (kept in history)" value={reason} onChange={(e) => setReason(e.target.value)} />
      <div>
        <Button onClick={save} loading={saving}>
          Save
        </Button>
      </div>
    </div>
  );
}
