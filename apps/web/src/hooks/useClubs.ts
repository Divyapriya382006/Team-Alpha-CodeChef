import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clubsApi, type ListClubsParams, type UpdateClubPayload } from "../lib/api/clubs";
import type { ClubDetail, ListQuery } from "../types";

export function useClubs(params: ListClubsParams) {
  return useQuery({
    queryKey: ["clubs", params],
    queryFn: () => clubsApi.list(params),
  });
}

export function useClub(id: string | undefined) {
  return useQuery({
    queryKey: ["club", id],
    queryFn: () => clubsApi.get(id as string),
    enabled: !!id,
  });
}

export function useClubMembers(clubId: string | undefined, params: ListQuery = {}) {
  return useQuery({
    queryKey: ["club", clubId, "members", params],
    queryFn: () => clubsApi.listMembers(clubId as string, params),
    enabled: !!clubId,
  });
}

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClubPayload) => clubsApi.update(clubId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<ClubDetail | undefined>(["club", clubId], (prev) => (prev ? { ...prev, ...updated } : prev));
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}

export function useAddClubMember(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => clubsApi.addMember(clubId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["club", clubId, "members"] }),
  });
}

export function useRemoveClubMember(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => clubsApi.removeMember(clubId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId, "members"] });
      // Removing/leaving changes the caller's own clubMemberships[] whenever they're the target
      // (self-remove from Profile, or a Club Head removing themself) — refetch per
      // FINAL_TEAM_BUILD_GUIDE.md's "refetch /auth/me after ... being removed from a club" rule.
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useDemoteClubMember(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => clubsApi.demoteMember(clubId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["club", clubId, "members"] }),
  });
}

export function useReassignFacultyCoordinator(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facultyCoordinatorId: string) => clubsApi.reassignFacultyCoordinator(clubId, facultyCoordinatorId),
    onSuccess: (updated) => {
      queryClient.setQueryData<ClubDetail | undefined>(["club", clubId], (prev) => (prev ? { ...prev, ...updated } : prev));
    },
  });
}

export function useTransferClubHead(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newClubHeadUserId: string) => clubsApi.transferHead(clubId, newClubHeadUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["club", clubId, "members"] }),
  });
}
