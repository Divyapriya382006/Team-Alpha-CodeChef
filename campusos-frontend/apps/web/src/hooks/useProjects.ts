import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  type CreateProjectPayload,
  type EditProjectPayload,
  type ListProjectsParams,
} from "../lib/api/projects";
import type { ProjectDetail } from "../types";

export function useProjects(params: ListProjectsParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => projectsApi.list(params),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateProject(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectsApi.create(clubId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useEditProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EditProjectPayload) => projectsApi.edit(projectId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProjectDetail | undefined>(["project", projectId], updated);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}
