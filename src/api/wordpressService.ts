import { apiClient } from "./apiClient";
import type { ChangePacket, ProposedChanges, WordPressInventoryItem, WordPressObjectType, WordPressStatus } from "@/types/wordpress";

async function getStatus(businessId: number): Promise<WordPressStatus> {
  const { data } = await apiClient.get<WordPressStatus>(`/wordpress/${businessId}/status/`);
  return data;
}

async function connect(businessId: number, input: { website_url: string; username: string; application_password: string }): Promise<void> {
  await apiClient.post(`/wordpress/${businessId}/connect/`, input);
}

async function disconnect(businessId: number): Promise<void> {
  await apiClient.post(`/wordpress/${businessId}/disconnect/`);
}

async function getInventory(businessId: number, objectType: WordPressObjectType): Promise<WordPressInventoryItem[]> {
  const { data } = await apiClient.get<WordPressInventoryItem[]>(`/wordpress/${businessId}/inventory/`, { params: { type: objectType } });
  return data;
}

async function listChangePackets(businessId: number): Promise<ChangePacket[]> {
  const { data } = await apiClient.get<ChangePacket[]>(`/wordpress/${businessId}/change-packets/`);
  return data;
}

async function proposeChange(businessId: number, input: { target_object_type: WordPressObjectType; target_object_id: number; proposed_changes: ProposedChanges; reason: string }): Promise<ChangePacket> {
  const { data } = await apiClient.post<ChangePacket>(`/wordpress/${businessId}/change-packets/`, input);
  return data;
}

async function decide(businessId: number, packetId: number, approve: boolean): Promise<ChangePacket> {
  const { data } = await apiClient.post<ChangePacket>(`/wordpress/${businessId}/change-packets/${packetId}/decision/`, { approve });
  return data;
}

async function apply(businessId: number, packetId: number): Promise<void> {
  await apiClient.post(`/wordpress/${businessId}/change-packets/${packetId}/apply/`);
}

async function rollback(businessId: number, packetId: number): Promise<void> {
  await apiClient.post(`/wordpress/${businessId}/change-packets/${packetId}/rollback/`);
}

export const wordpressService = { getStatus, connect, disconnect, getInventory, listChangePackets, proposeChange, decide, apply, rollback };
