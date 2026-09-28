import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ApiError, type ApiErrorBody } from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "/api/v1" : "http://localhost:8000/api/v1");

/**
 * The access token lives in memory only — never localStorage/sessionStorage.
 * A page reload loses it on purpose; `bootstrapSession()` (called once at app
 * startup) silently re-derives a fresh one from the httpOnly refresh cookie.
 * This is the whole point of the httpOnly-cookie design: an XSS payload that
 * runs in this page can see this variable, but a real access token has a
 * 15-minute blast radius instead of a stolen-forever refresh token.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends/receives the httpOnly refresh cookie on the /auth/* endpoints
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// --- 401 handling: refresh once, retry the original request, and de-duplicate
// concurrent refreshes so 5 simultaneous requests don't fire 5 refresh calls. ---
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access: string }>(`${BASE_URL}/auth/refresh/`, null, { withCredentials: true })
      .then((response) => {
        setAccessToken(response.data.access);
        return response.data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/register") || originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        setAccessToken(null);
        // Let the caller (useAuth) react to this — it listens for this event
        // to clear user state and redirect to sign-in.
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
    }

    return Promise.reject(new ApiError(error.response?.status ?? 0, error.response?.data?.error));
  },
);

export { refreshAccessToken };
