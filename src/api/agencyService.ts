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
  created_at: string;
  businesses: { id: number; name: string; website: string | null }[];
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

export const agencyService = { listClients, createCustomer };
