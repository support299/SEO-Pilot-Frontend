import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { useApprovals } from "@/hooks/useApprovals";
import { useBusiness } from "@/hooks/useBusiness";
import { useSiteHealth } from "@/hooks/useSiteHealth";
import type { Approval, ApprovalDecision } from "@/types/approvals";

const URL_PREVIEW_LIMIT = 5;

export function ApprovalsPage() {
  const { business } = useBusiness();
  const health = useSiteHealth(business.id);
  const { approvals, loadState, workingId, decideError, decide } = useApprovals(business.id);

  const pending = approvals.filter((approval) => approval.status === "pending");
  const decided = approvals.filter((approval) => approval.status === "approved" || approval.status === "rejected");
  const resolved = approvals.filter((approval) => approval.status === "resolved");
  const crawlCompleted = health.loadState === "loaded" && health.report?.status === "completed";

  return (
    <>
      <PageHeader
        eyebrow="Approvals"
        title="Approvals"
        description="Each issue from the latest completed crawl is listed once, with the pages it affects. Approve it to mark it as work you want done, or reject it to set it aside. This only records your decision. SEO Pilot does not change your website."
      />

      {loadState === "loading" || loadState === "idle" ? <LoadingState label="Checking the latest crawl…" /> : null}
      {loadState === "error" ? <ErrorText>Couldn&apos;t load approvals right now.</ErrorText> : null}
      <ErrorText>{decideError}</ErrorText>

      {loadState === "loaded" && approvals.length === 0 ? (
        crawlCompleted ? (
          <EmptyState title="No decisions needed" description={`The latest crawl of ${business.name} found nothing that needs an owner's decision.`} />
        ) : (
          <EmptyState
            title="No crawl has finished"
            description={`Approvals for ${business.name} come from a completed crawl. Nothing is listed until Site Health has one.`}
            action={
              <Link to={`/businesses/${business.id}/site-health`} className="text-sm font-medium text-primary hover:text-primary-hover">
                Open Site Health →
              </Link>
            }
          />
        )
      ) : null}

      {pending.length > 0 ? (
        <ApprovalGroup label="Needs your decision" approvals={pending} workingId={workingId} onDecide={decide} />
      ) : null}
      {loadState === "loaded" && approvals.length > 0 && pending.length === 0 ? (
        <EmptyState title="No decisions needed" description="Every issue from the latest crawl already has a decision." />
      ) : null}
      {decided.length > 0 ? <ApprovalGroup label="Decided" approvals={decided} workingId={workingId} onDecide={decide} /> : null}
      {resolved.length > 0 ? <ApprovalGroup label="No longer in the latest crawl" approvals={resolved} workingId={workingId} onDecide={decide} /> : null}
    </>
  );
}

function ApprovalGroup({
  label,
  approvals,
  workingId,
  onDecide,
}: {
  label: string;
  approvals: Approval[];
  workingId: number | null;
  onDecide: (approvalId: number, decision: ApprovalDecision) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">
        {label} <span className="font-normal text-muted">({approvals.length})</span>
      </h2>
      {approvals.map((approval) => {
        const busy = workingId === approval.id;
        const shown = approval.affected_urls.slice(0, URL_PREVIEW_LIMIT);
        const hidden = approval.affected_urls.length - shown.length;
        return (
          <article key={approval.id} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
              {approval.category} · {approval.severity}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">{approval.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{approval.detail}</p>
            {shown.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-foreground">
                {shown.map((url) => (
                  <li key={url} className="truncate" title={url}>
                    {url}
                  </li>
                ))}
                {hidden > 0 ? <li className="text-muted">and {hidden} more</li> : null}
              </ul>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {approval.status === "pending" ? (
                <>
                  <Button loading={busy} onClick={() => onDecide(approval.id, "approved")}>
                    Approve
                  </Button>
                  <Button variant="secondary" disabled={busy} onClick={() => onDecide(approval.id, "rejected")}>
                    Reject
                  </Button>
                </>
              ) : null}
              {approval.status === "approved" || approval.status === "rejected" ? (
                <>
                  <p className="text-sm text-muted">
                    {approval.status === "approved" ? "Approved" : "Rejected"}
                    {approval.decided_at ? ` on ${new Date(approval.decided_at).toLocaleDateString("en-US")}` : ""}
                  </p>
                  <Button variant="secondary" loading={busy} onClick={() => onDecide(approval.id, "pending")}>
                    Reopen
                  </Button>
                </>
              ) : null}
              {approval.status === "resolved" ? <p className="text-sm text-muted">The latest crawl no longer finds this issue.</p> : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}
