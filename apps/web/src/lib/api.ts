import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiEnvelope, AuthUserBase, CurrentUser, LoginPayload, RegisterPayload } from "../types";
import { ApiError } from "./apiError";
import { clearToken, getToken } from "./tokenStorage";
import { mockGetCurrentUser, mockLogin, mockRegister } from "./mockData";

// Defaults to the mock backend until apps/api is deployed and VITE_USE_MOCK is flipped to false.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status ?? 500;
    const body = error.response?.data;

    // Global 401 handling per FINAL_API_CONTRACT.md: missing/invalid/expired token clears
    // storage and drops the user back to /login, regardless of which endpoint triggered it.
    if (status === 401) {
      clearToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(
      new ApiError(body?.message ?? error.message ?? "Something went wrong", status, body?.errors),
    );
  },
);

async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data: envelope } = await request;
  return envelope.data as T;
}

// Generic envelope-unwrapping helpers. Every future module (clubs.ts, events.ts, ...) is built
// on top of these rather than calling apiClient directly.
export const get = <T>(url: string, params?: any) =>
  unwrap<T>(apiClient.get(url, { params }));
export const post = <T>(url: string, body?: unknown) => unwrap<T>(apiClient.post(url, body));
export const patch = <T>(url: string, body?: unknown) => unwrap<T>(apiClient.patch(url, body));
export const del = <T>(url: string) => unwrap<T>(apiClient.delete(url));

// Auth endpoints — the one module AuthContext depends on directly. Every call here transparently
// switches between the real API and lib/mockData.ts based on USE_MOCK.
export const authApi = {
  login: (payload: LoginPayload): Promise<{ user: AuthUserBase; token: string }> =>
    USE_MOCK ? mockLogin(payload) : post("/auth/login", payload),

  register: (payload: RegisterPayload): Promise<{ user: AuthUserBase; token: string }> =>
    USE_MOCK ? mockRegister(payload) : post("/auth/register", payload),

  getCurrentUser: (): Promise<CurrentUser> => (USE_MOCK ? mockGetCurrentUser() : get("/auth/me")),
};
