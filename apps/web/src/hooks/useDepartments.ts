import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "../lib/api/departments";

export function useClubDepartments(clubId: string | undefined) {
  return useQuery({
    queryKey: ["club", clubId, "departments"],
    queryFn: () => departmentsApi.listForClub(clubId as string),
    enabled: !!clubId,
  });
}

export function useCreateDepartment(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => departmentsApi.create(clubId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId, "departments"] });
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}

export function useDepartment(id: string | undefined) {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => departmentsApi.get(id as string),
    enabled: !!id,
  });
}

export function useSetDepartmentHead(departmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string | null) => departmentsApi.setHead(departmentId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["department", departmentId] }),
  });
}

export function useAddDepartmentMember(departmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => departmentsApi.addMember(departmentId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["department", departmentId] }),
  });
}

// GET /departments/:id is restricted to that club's Club Head, the department's own Head, or a
// Super Admin (FINAL_TEAM_BUILD_GUIDE.md "Department Management" access + mockGetDepartment). A
// plain department member who isn't the head gets a 403 — which is fine here, since that 403
// itself proves they aren't the head, so we swallow it and treat the department as "not headed
// by me" rather than surfacing an error for what is really just an expected access boundary.
export function useMyDepartmentHeadships(departmentIds: string[], userId: string | undefined) {
  const results = useQueries({
    queries: departmentIds.map((id) => ({
      queryKey: ["department", id, "head-check"],
      queryFn: async () => {
        try {
          return await departmentsApi.get(id);
        } catch {
          return null;
        }
      },
      enabled: !!userId,
      retry: false,
      staleTime: 60_000,
    })),
  });

  const headDepartmentIds = new Set<string>();
  results.forEach((result, i) => {
    if (result.data && userId && result.data.headUserId === userId) {
      headDepartmentIds.add(departmentIds[i]);
    }
  });
  return headDepartmentIds;
}

export function useRemoveDepartmentMember(departmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => departmentsApi.removeMember(departmentId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["department", departmentId] }),
  });
}
