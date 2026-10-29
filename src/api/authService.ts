import { apiClient, refreshAccessToken, setAccessToken, setSsoCredentials } from "./apiClient";
import type { Me, User } from "@/types/auth";

export type RegisterInput = { email: string; password: string; full_name?: string };
export type LoginInput = { email: string; password: string };

async function register(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<{ access: string; user: User }>("/auth/register/", input);
  setAccessToken(data.access);
  return data.user;
}

async function login(input: LoginInput): Promise<User> {
  const { data } = await apiClient.post<{ access: string; user: User }>("/auth/login/", input);
  setAccessToken(data.access);
  return data.user;
}

/** Sign in from a GoHighLevel menu link (?location_id=…&sso=…). Returns false if the link isn't valid. */
async function ssoLogin(locationId: string, token: string): Promise<boolean> {
  try {
    const { data } = await apiClient.post<{ access: string; user: User }>("/auth/sso/", { location_id: locationId, token });
    setAccessToken(data.access);
    setSsoCredentials({ locationId, token });
    return true;
  } catch {
    return false;
  }
}

async function logout(): Promise<void> {
  await apiClient.post("/auth/logout/");
  setAccessToken(null);
  setSsoCredentials(null);
}

async function me(): Promise<Me> {
  const { data } = await apiClient.get<Me>("/auth/me/");
  return data;
}

/** Called once at app startup: tries to turn an existing refresh cookie into a fresh access token, silently. */
async function bootstrapSession(): Promise<boolean> {
  try {
    await refreshAccessToken();
    return true;
  } catch {
    return false;
  }
}

export const authService = { register, login, ssoLogin, logout, me, bootstrapSession };
