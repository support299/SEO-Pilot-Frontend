import { createContext } from "react";
import type { LoginInput, RegisterInput } from "@/api/authService";
import type { Account, User } from "@/types/auth";

export type AuthState = {
  user: User | null;
  accounts: Account[];
  /** True until the initial session bootstrap (silent refresh) has resolved — avoids a sign-in flash on reload. */
  isInitializing: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
