export type User = {
  id: number;
  email: string;
  full_name: string;
  date_joined: string;
};

export type Account = {
  id: number;
  name: string;
  role: "owner" | "member";
  created_at: string;
};

export type Me = {
  user: User;
  accounts: Account[];
};
