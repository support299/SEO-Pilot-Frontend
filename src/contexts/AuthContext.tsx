import { useEffect, useState, type ReactNode } from "react";
import { authService, type LoginInput, type RegisterInput } from "@/api/authService";
import type { Account, User } from "@/types/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  async function loadMe() {
    const me = await authService.me();
    setUser(me.user);
    setAccounts(me.accounts);
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const hasSession = await authService.bootstrapSession();
      if (hasSession) {
        try {
          await loadMe();
        } catch {
          // Refresh cookie was valid but /me failed for some other reason — treat as signed out.
        }
      }
      if (!cancelled) setIsInitializing(false);
    }

    bootstrap();

    function handleSessionExpired() {
      setUser(null);
      setAccounts([]);
    }
    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  async function login(input: LoginInput) {
    await authService.login(input);
    await loadMe();
  }

  async function register(input: RegisterInput) {
    await authService.register(input);
    await loadMe();
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    setAccounts([]);
  }

  return <AuthContext.Provider value={{ user, accounts, isInitializing, login, register, logout }}>{children}</AuthContext.Provider>;
}
