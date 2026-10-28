import { ChangePacketCard } from "@/components/wordpress/ChangePacketCard";
import type { useWordPress } from "@/hooks/useWordPress";
import type { ChangePacket } from "@/types/wordpress";

export function PacketGroup({ label, packets, wp, canEdit }: { label: string; packets: ChangePacket[]; wp: ReturnType<typeof useWordPress>; canEdit: boolean }) {
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
