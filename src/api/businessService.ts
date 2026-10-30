import { apiClient } from "./apiClient";
import type { Business, Paginated } from "@/types/business";

async function list(): Promise<Business[]> {
  const { data } = await apiClient.get<Paginated<Business>>("/businesses/");
  return data.results;
}

async function get(id: number): Promise<Business> {
  const { data } = await apiClient.get<Business>(`/businesses/${id}/`);
  return data;
}

async function create(input: { account: number; name: string; website?: string }): Promise<Business> {
  const { data } = await apiClient.post<Business>("/businesses/", input);
  return data;
}

async function update(id: number, input: Partial<Pick<Business, "name" | "website" | "is_paused">>): Promise<Business> {
  const { data } = await apiClient.patch<Business>(`/businesses/${id}/`, input);
  return data;
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`/businesses/${id}/`);
}

export const businessService = { list, get, create, update, remove };
