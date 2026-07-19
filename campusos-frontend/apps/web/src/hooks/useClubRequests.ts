import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clubRequestsApi,
  type ListClubRequestsParams,
  type SubmitClubRequestPayload,
} from "../lib/api/clubRequests";

export function useSubmitClubRequest() {
  return useMutation({
    mutationFn: (payload: SubmitClubRequestPayload) => clubRequestsApi.submit(payload),
  });
}

export function useClubRequestsList(params: ListClubRequestsParams) {
  return useQuery({
    queryKey: ["clubRequests", params],
    queryFn: () => clubRequestsApi.list(params),
  });
}

export function useClubRequest(id: string | undefined) {
  return useQuery({
    queryKey: ["clubRequest", id],
    queryFn: () => clubRequestsApi.getOne(id as string),
    enabled: !!id,
  });
}

export function useApproveClubRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, facultyCoordinatorId }: { id: string; facultyCoordinatorId: string }) =>
      clubRequestsApi.approve(id, facultyCoordinatorId),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["clubRequests"] });
      queryClient.invalidateQueries({ queryKey: ["clubRequest", id] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}

export function useRejectClubRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => clubRequestsApi.reject(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["clubRequests"] });
      queryClient.invalidateQueries({ queryKey: ["clubRequest", id] });
    },
  });
}

export function useWithdrawClubRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clubRequestsApi.withdraw(id),
    onSuccess: (_data, id) => queryClient.invalidateQueries({ queryKey: ["clubRequest", id] }),
  });
}
