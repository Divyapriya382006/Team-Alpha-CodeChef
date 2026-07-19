import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type SearchUsersParams } from "../lib/api/users";
import type { PlatformRole } from "../types";

// Type-ahead flavor — only fires once there's a search term (Club/Faculty Coordinator pickers).
export function useUserSearch(params: SearchUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.search(params),
    enabled: !!params.search && params.search.trim().length > 0,
  });
}

// Listing flavor — no search-gating, for a paginated table of every user (User Management).
export function useUsers(params: SearchUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.search(params),
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, platformRole }: { userId: string; platformRole: PlatformRole }) =>
      usersApi.changeRole(userId, platformRole),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
