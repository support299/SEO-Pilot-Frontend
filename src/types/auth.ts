export type User = {
  id: number;
  email: string;
  full_name: string;
  is_agency_admin: boolean;
  date_joined: string;
};

export type Account = {
  id: number;
  name: string;
  role: "owner" | "member" | "viewer";
  created_at: string;
};

export type Me = {
  user: User;
  accounts: Account[];
};
