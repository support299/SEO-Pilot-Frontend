import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { ChangePacketCard } from "@/components/wordpress/ChangePacketCard";
import { ProposeChangeForm } from "@/components/wordpress/ProposeChangeForm";
import { useBusiness } from "@/hooks/useBusiness";
import { useWordPress } from "@/hooks/useWordPress";
import type { ChangePacket } from "@/types/wordpress";

export function ExecutionPage() {
  const { business } = useBusiness();
  const wp = useWordPress(business.id);

  if (wp.statusState === "loading" || wp.statusState === "idle") {
    return (
      <>
        <PageHeader eyebrow="Execution" title="Execution" description="Changes proposed for this website, from idea to published." />
        <LoadingState label="Checking WordPress connection…" />
      </>
    );
  }

  if (wp.statusState === "error") {
    return (
      <>
        <PageHeader eyebrow="Execution" title="Execution" description="Changes proposed for this website, from idea to published." />
        <ErrorText>Couldn&apos;t check the WordPress connection right now.</ErrorText>
      </>
    );
  }

  if (!wp.status?.connected) {
    return (
      <>
        <PageHeader eyebrow="Execution" title="Execution" description="Publishing approved changes to this website requires connecting WordPress first." />
        <EmptyState
          title="WordPress is not connected"
          description={`Connect ${business.name}'s WordPress site in Connections to start proposing and publishing changes.`}
          action={
            <Link to={`/businesses/${business.id}/connections`} className="text-sm font-medium text-primary hover:text-primary-hover">
              Go to Connections →
            </Link>
          }
        />
      </>
    );
  }

  const pending = wp.packets?.filter((p) => p.status === "awaiting_approval" || p.status === "stale") ?? [];
  const publishing = wp.packets?.filter((p) => p.status === "applying") ?? [];
  const ready = wp.packets?.filter((p) => p.status === "approved") ?? [];
  const done = wp.packets?.filter((p) => p.status === "applied" || p.status === "rolled_back") ?? [];
  const other = wp.packets?.filter((p) => p.status === "rejected" || p.status === "failed" || p.status === "rollback_blocked") ?? [];

  return (
    <>
      <PageHeader eyebrow="Execution" title="Execution" description={`Changes proposed for ${wp.status.website_url.replace(/^https?:\/\//, "")}, from idea to published.`} />

      {business.can_edit ? (
        <Card>
          <h2 className="text-sm font-semibold text-foreground">Propose a change</h2>
          <p className="mt-1 text-sm text-muted">Pick a page or post and propose a new title or meta description. Nothing goes live until it&apos;s approved and published.</p>
          <div className="mt-4">
            <ProposeChangeForm getInventory={wp.getInventory} onPropose={wp.proposeChange} />
          </div>
        </Card>
      ) : null}

      {wp.packetsState === "loading" || wp.packetsState === "idle" ? <LoadingState label="Loading proposed changes…" /> : null}
      {wp.packetsState === "error" ? <ErrorText>Couldn&apos;t load proposed changes right now.</ErrorText> : null}

      {wp.packetsState === "loaded" && (wp.packets?.length ?? 0) === 0 ? (
        <EmptyState title="No changes proposed yet" description={business.can_edit ? "Propose a change above to see it listed here." : "Changes your SEO team prepares for this website will be listed here."} />
      ) : null}

      {pending.length > 0 ? <PacketGroup label="Needs a decision" canEdit={business.can_edit} packets={pending} wp={wp} /> : null}
      {publishing.length > 0 ? <PacketGroup label="Publishing now" canEdit={business.can_edit} packets={publishing} wp={wp} /> : null}
      {ready.length > 0 ? <PacketGroup label="Approved — ready to publish" canEdit={business.can_edit} packets={ready} wp={wp} /> : null}
      {other.length > 0 ? <PacketGroup label="Needs attention" canEdit={business.can_edit} packets={other} wp={wp} /> : null}
      {done.length > 0 ? <PacketGroup label="History" canEdit={business.can_edit} packets={done} wp={wp} /> : null}
    </>
  );
}

function PacketGroup({ label, packets, wp, canEdit }: { label: string; packets: ChangePacket[]; wp: ReturnType<typeof useWordPress>; canEdit: boolean }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">
        {label} <span className="font-normal text-muted">({packets.length})</span>
      </h2>
      {packets.map((packet) => (
        <ChangePacketCard
          key={packet.id}
          packet={packet}
          canEdit={canEdit}
          busy={wp.workingIds.has(packet.id)}
          onDecide={(approve) => wp.decide(packet.id, approve)}
          onApply={() => wp.applyPacket(packet.id)}
          onRollback={() => wp.rollbackPacket(packet.id)}
        />
      ))}
    </section>
  );
}
