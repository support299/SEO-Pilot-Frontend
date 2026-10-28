import { useCallback, useEffect, useRef, useState } from "react";
import { wordpressService } from "@/api/wordpressService";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/types/api";
import type { ChangePacket, ProposedChanges, WordPressInventoryItem, WordPressObjectType, WordPressStatus } from "@/types/wordpress";

type LoadState = "idle" | "loading" | "loaded" | "error";

// Publishing/undoing run in a background job, so the API answers right away and the
// real outcome has to be polled for.
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 90_000;

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function useWordPress(businessId: number) {
  const [status, setStatus] = useState<WordPressStatus | null>(null);
  const [statusState, setStatusState] = useState<LoadState>("idle");
  const [packets, setPackets] = useState<ChangePacket[] | null>(null);
  const [packetsState, setPacketsState] = useState<LoadState>("idle");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [workingIds, setWorkingIds] = useState<ReadonlySet<number>>(new Set());
  // Mirrors workingIds synchronously so a fast second click is rejected before React re-renders.
  const workingRef = useRef(new Set<number>());
  const mounted = useRef(true);
  const toast = useToast();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setStatusState("loading");

    wordpressService.getStatus(businessId).then(
      (result) => {
        if (cancelled) return;
        setStatus(result);
        setStatusState("loaded");
      },
      () => {
        if (!cancelled) setStatusState("error");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [businessId, reloadToken]);

  useEffect(() => {
    if (!status?.connected) return;
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setPacketsState("loading");

    wordpressService.listChangePackets(businessId).then(
      (result) => {
        if (cancelled) return;
        setPackets(result);
        setPacketsState("loaded");
      },
      () => {
        if (!cancelled) setPacketsState("error");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [businessId, status?.connected, reloadToken]);

  function reload() {
    setReloadToken((token) => token + 1);
  }

  async function connect(input: { website_url: string; username: string; application_password: string }) {
    setIsConnecting(true);
    try {
      await wordpressService.connect(businessId, input);
      reload();
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnect() {
    setIsDisconnecting(true);
    try {
      await wordpressService.disconnect(businessId);
      setPackets(null);
      reload();
    } finally {
      setIsDisconnecting(false);
    }
  }

  const getInventory = useCallback((objectType: WordPressObjectType): Promise<WordPressInventoryItem[]> => wordpressService.getInventory(businessId, objectType), [businessId]);

  function upsertPacket(packet: ChangePacket) {
    setPackets((current) => {
      if (!current) return [packet];
      return current.some((p) => p.id === packet.id) ? current.map((p) => (p.id === packet.id ? packet : p)) : [packet, ...current];
    });
  }

  function setPacketStatus(packetId: number, status: ChangePacket["status"]) {
    setPackets((current) => current?.map((p) => (p.id === packetId ? { ...p, status } : p)) ?? current);
  }

  /** Marks a packet as busy; returns false if it already is (double click). */
  function startWork(packetId: number) {
    if (workingRef.current.has(packetId)) return false;
    workingRef.current.add(packetId);
    setWorkingIds(new Set(workingRef.current));
    return true;
  }

  function endWork(packetId: number) {
    workingRef.current.delete(packetId);
    if (mounted.current) setWorkingIds(new Set(workingRef.current));
  }

  /** Polls without the page-level loading state until `isDone` holds; null on timeout or unmount. */
  async function waitForPacket(packetId: number, isDone: (packet: ChangePacket) => boolean) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (mounted.current && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      if (!mounted.current) return null;
      const list = await wordpressService.listChangePackets(businessId).catch(() => null);
      const packet = list?.find((p) => p.id === packetId);
      if (!list || !packet) continue;
      if (isDone(packet)) {
        setPackets(list);
        return packet;
      }
    }
    return null;
  }

  // Errors propagate: the propose form shows them next to the fields.
  async function proposeChange(input: { target_object_type: WordPressObjectType; target_object_id: number; proposed_changes: ProposedChanges; reason: string }) {
    const packet = await wordpressService.proposeChange(businessId, input);
    upsertPacket(packet);
    toast.show("success", "Change proposed — approve it below to continue.");
  }

  async function decide(packetId: number, approve: boolean) {
    if (!startWork(packetId)) return;
    try {
      upsertPacket(await wordpressService.decide(businessId, packetId, approve));
      toast.show("success", approve ? "Approved — ready to publish." : "Change rejected.");
    } catch (error) {
      toast.show("error", errorMessage(error));
    } finally {
      endWork(packetId);
    }
  }

  async function applyPacket(packetId: number) {
    if (!startWork(packetId)) return;
    try {
      await wordpressService.apply(businessId, packetId);
      setPacketStatus(packetId, "applying");
      const result = await waitForPacket(packetId, (p) => p.status !== "approved" && p.status !== "applying");
      if (result?.status === "applied") toast.show("success", "Published — the change is live on your website.");
      else if (result?.status === "failed" || result?.status === "stale") toast.show("error", result.last_error || "Publishing failed.");
      else toast.show("info", "Still publishing. This page will update when it finishes.");
    } catch (error) {
      toast.show("error", errorMessage(error));
    } finally {
      endWork(packetId);
    }
  }

  async function rollbackPacket(packetId: number) {
    if (!startWork(packetId)) return;
    try {
      await wordpressService.rollback(businessId, packetId);
      const result = await waitForPacket(packetId, (p) => p.status !== "applied");
      if (result?.status === "rolled_back") toast.show("success", "Change undone — the original was restored.");
      else if (result?.status === "rollback_blocked") toast.show("error", "Couldn't undo — the page changed again and needs a manual review.");
      else toast.show("error", "The undo didn't finish. Check the page and try again.");
    } catch (error) {
      toast.show("error", errorMessage(error));
    } finally {
      endWork(packetId);
    }
  }

  return {
    status,
    statusState,
    packets,
    packetsState,
    workingIds,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
    getInventory,
    proposeChange,
    decide,
    applyPacket,
    rollbackPacket,
    reload,
  };
}
