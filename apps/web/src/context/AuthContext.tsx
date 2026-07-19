import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../lib/api";
import { clearToken, getToken, setToken as persistToken } from "../lib/tokenStorage";
import type { CurrentUser, LoginPayload, RegisterPayload } from "../types";

interface AuthContextValue {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => getToken());

  // Hydrates on app load whenever a token is present. Cleared to null by the 401 interceptor
  // in lib/api.ts via a hard redirect, which naturally resets this state on remount.
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getCurrentUser,
    enabled: !!token,
    retry: false,
  });

  // Called explicitly after login/register instead of relying on query `enabled` flipping,
  // since toggling React state and re-running a query are not guaranteed to land in the same tick.
  const hydrateCurrentUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    queryClient.setQueryData(["auth", "me"], currentUser);
    return currentUser;
  }, [queryClient]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { token: newToken } = await authApi.login(payload);
      persistToken(newToken);
      setTokenState(newToken);
      // login/register never return clubMemberships (finalized decision 6.1) — /auth/me is the
      // only source for it, so we hydrate right after storing the token.
      await hydrateCurrentUser();
    },
    [hydrateCurrentUser],
  );

  const loginWithToken = useCallback(
    async (newToken: string) => {
      persistToken(newToken);
      setTokenState(newToken);
      await hydrateCurrentUser();
    },
    [hydrateCurrentUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { token: newToken } = await authApi.register(payload);
      persistToken(newToken);
      setTokenState(newToken);
      await hydrateCurrentUser();
    },
    [hydrateCurrentUser],
  );

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      token,
      isLoading: !!token && isLoading,
      login,
      loginWithToken,
      register,
      logout,
    }),
    [user, token, isLoading, login, loginWithToken, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
