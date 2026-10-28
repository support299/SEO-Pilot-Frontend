import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { PacketGroup } from "@/components/wordpress/PacketGroup";
import { useBusiness } from "@/hooks/useBusiness";
import { useWordPress } from "@/hooks/useWordPress";

const DESCRIPTION = "Changes suggested by your AI SEO agent. It reads this site's data and proposes fixes; nothing goes live until a person approves it.";

export function ManagerPage() {
  const { business } = useBusiness();
  const wp = useWordPress(business.id);

  if (wp.statusState === "loading" || wp.statusState === "idle" || wp.packetsState === "loading") {
    return (
      <>
        <PageHeader eyebrow="SEO Manager" title="SEO Manager" description={DESCRIPTION} />
        <LoadingState label="Loading agent activity…" />
      </>
    );
  }
  if (wp.statusState === "error" || wp.packetsState === "error") {
    return (
      <>
        <PageHeader eyebrow="SEO Manager" title="SEO Manager" description={DESCRIPTION} />
        <ErrorText>Couldn&apos;t load agent activity right now.</ErrorText>
      </>
    );
  }

  const fromAgent = (wp.packets ?? []).filter((p) => p.source === "agent");
  const count = (...statuses: string[]) => fromAgent.filter((p) => statuses.includes(p.status)).length;
  const waiting = fromAgent.filter((p) => p.status === "awaiting_approval" || p.status === "stale" || p.status === "approved");
  const recent = fromAgent.filter((p) => !waiting.includes(p)).slice(0, 10);
  const agentNames = [...new Set(fromAgent.map((p) => p.agent_name).filter(Boolean))];

  return (
    <>
      <PageHeader eyebrow="SEO Manager" title="SEO Manager" description={DESCRIPTION} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Suggested by the agent" value={fromAgent.length} />
        <Stat label="Waiting for approval" value={count("awaiting_approval", "stale", "approved")} />
        <Stat label="Published" value={count("applied")} />
        <Stat label="Rejected" value={count("rejected")} />
      </div>
      {agentNames.length > 0 ? <p className="text-xs text-muted">Agents seen: {agentNames.join(", ")}</p> : null}

      {fromAgent.length === 0 ? (
        <EmptyState
          title="No agent suggestions yet"
          description={`When your AI agent reviews ${business.name}, its suggested title and meta description changes will appear here for approval.`}
          action={
            <Link to={`/businesses/${business.id}/work`} className="text-sm font-medium text-primary hover:text-primary-hover">
              Propose a change yourself →
            </Link>
          }
        />
      ) : null}

      {waiting.length > 0 ? <PacketGroup label="Waiting for your decision" packets={waiting} wp={wp} canEdit={business.can_edit} /> : null}
      {recent.length > 0 ? <PacketGroup label="Recent activity" packets={recent} wp={wp} canEdit={business.can_edit} /> : null}

      <Card>
        <h2 className="text-sm font-semibold text-foreground">How it works</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>The agent reads this site&apos;s crawl results, search data and WordPress pages.</li>
          <li>It proposes a new title or meta description with a short reason.</li>
          <li>You approve or reject it here. Approved changes are published to WordPress and can be undone.</li>
        </ol>
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">{value}</p>
    </Card>
  );
}
