import { apiClient } from "./apiClient";

export type CustomerInput = {
  customer_name: string;
  business_name?: string;
  website?: string;
  email?: string;
  password?: string;
};

export type CreatedCustomer = {
  account: { id: number; name: string };
  business: { id: number; name: string; website: string | null };
  login_email: string | null;
};

export type AgencyClient = {
  id: number;
  name: string;
  is_paused: boolean;
  created_at: string;
  businesses: { id: number; name: string; website: string | null; is_paused: boolean; effective_paused: boolean }[];
  members: { email: string; role: string }[];
};

async function listClients(): Promise<AgencyClient[]> {
  const { data } = await apiClient.get<AgencyClient[]>("/agency/customers/");
  return data;
}

async function createCustomer(input: CustomerInput): Promise<CreatedCustomer> {
  const { data } = await apiClient.post<CreatedCustomer>("/agency/customers/", input);
  return data;
}

async function updateCustomer(id: number, input: { name?: string; is_paused?: boolean }): Promise<AgencyClient> {
  const { data } = await apiClient.patch<AgencyClient>(`/agency/customers/${id}/`, input);
  return data;
}

async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/agency/customers/${id}/`);
}

export const agencyService = { listClients, createCustomer, updateCustomer, deleteCustomer };
