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

async function update(id: number, input: Partial<Pick<Business, "name" | "website">>): Promise<Business> {
  const { data } = await apiClient.patch<Business>(`/businesses/${id}/`, input);
  return data;
}

export const businessService = { list, get, create, update };
