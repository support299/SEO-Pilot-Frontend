import type { PackageKey, SubscriptionStatus } from "./plan";

export type Business = {
  id: number;
  account: number;
  name: string;
  website: string | null;
  /** Customer (account) this business belongs to. */
  account_name: string;
  is_paused?: boolean;
  is_account_paused?: boolean;
  effective_paused?: boolean;
  /** False for customer logins: they see results but every action is hidden (and refused by the API). */
  can_edit: boolean;
  package?: PackageKey | null;
  package_label?: string | null;
  subscription_status?: SubscriptionStatus;
  created_at: string;
  updated_at: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
