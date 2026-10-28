import { Button } from "@/components/ui/Button";
import type { ChangePacket } from "@/types/wordpress";

const STATUS_LABEL: Record<ChangePacket["status"], string> = {
  awaiting_approval: "Awaiting approval",
  approved: "Approved — not yet published",
  rejected: "Rejected",
  applying: "Publishing…",
  applied: "Published",
  failed: "Failed",
  stale: "Needs review — page changed",
  rolled_back: "Rolled back",
  rollback_blocked: "Rollback needs manual review",
};

const STATUS_COLOR: Record<ChangePacket["status"], string> = {
  awaiting_approval: "text-muted",
  approved: "text-primary",
  rejected: "text-muted",
  applying: "text-primary",
  applied: "text-success",
  failed: "text-danger",
  stale: "text-danger",
  rolled_back: "text-muted",
  rollback_blocked: "text-danger",
};

export function ChangePacketCard({
  packet,
  onDecide,
  onApply,
  onRollback,
  canEdit,
  busy,
}: {
  packet: ChangePacket;
  canEdit: boolean;
  busy: boolean;
  onDecide: (approve: boolean) => Promise<void>;
  onApply: () => Promise<void>;
  onRollback: () => Promise<void>;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className={`text-xs font-bold uppercase tracking-[0.08em] ${STATUS_COLOR[packet.status]}`}>
        {packet.status === "applying" ? <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary align-[-2px]" aria-hidden="true" /> : null}
        {STATUS_LABEL[packet.status]}
        {packet.source === "agent" ? <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">AI suggested{packet.agent_name ? ` · ${packet.agent_name}` : ""}</span> : null}
      </p>
      <h3 className="mt-2 text-sm font-semibold text-foreground">
        {packet.target_object_type} #{packet.target_object_id}
        {packet.target_url ? (
          <a href={packet.target_url} target="_blank" rel="noreferrer" className="ml-2 text-xs font-normal text-primary hover:text-primary-hover">
            View live →
          </a>
        ) : null}
      </h3>

      {packet.reason ? <p className="mt-2 text-sm text-muted">{packet.reason}</p> : null}

      <dl className="mt-3 space-y-1 text-sm">
        {packet.proposed_changes.title ? (
          <div>
            <dt className="inline font-medium text-foreground">New title: </dt>
            <dd className="inline text-muted">{packet.proposed_changes.title}</dd>
          </div>
        ) : null}
        {packet.proposed_changes.meta_description ? (
          <div>
            <dt className="inline font-medium text-foreground">New meta description: </dt>
            <dd className="inline text-muted">{packet.proposed_changes.meta_description}</dd>
          </div>
        ) : null}
      </dl>

      {packet.last_error ? <p className="mt-3 text-sm text-danger">{packet.last_error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canEdit && (packet.status === "awaiting_approval" || packet.status === "stale") ? (
          <>
            <Button loading={busy} loadingText="Approving…" onClick={() => onDecide(true)}>
              {packet.status === "stale" ? "Re-approve with latest page" : "Approve"}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => onDecide(false)}>
              Reject
            </Button>
          </>
        ) : null}
        {canEdit && packet.status === "approved" ? (
          <Button loading={busy} loadingText="Publishing…" onClick={onApply}>
            Publish now
          </Button>
        ) : null}
        {canEdit && packet.status === "applied" ? (
          <Button variant="secondary" loading={busy} loadingText="Undoing…" onClick={onRollback}>
            Undo this change
          </Button>
        ) : null}
      </div>
    </article>
  );
}
