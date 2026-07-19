import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementsApi, type CreateAnnouncementPayload } from "../lib/api/announcements";
import type { ListQuery } from "../types";

export function useAnnouncements(params: ListQuery) {
  return useQuery({
    queryKey: ["announcements", params],
    queryFn: () => announcementsApi.list(params),
  });
}

export function useAnnouncement(id: string | undefined) {
  return useQuery({
    queryKey: ["announcement", id],
    queryFn: () => announcementsApi.getOne(id as string),
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) => announcementsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });
}
