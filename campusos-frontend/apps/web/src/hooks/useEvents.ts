import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  eventsApi,
  type CreateEventPayload,
  type EditEventPayload,
  type ListEventsParams,
} from "../lib/api/events";
import type { EventDetail } from "../types";

export function useEvents(params: ListEventsParams) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => eventsApi.list(params),
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateEvent(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsApi.create(clubId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useEditEvent(clubId: string, eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EditEventPayload) => eventsApi.edit(clubId, eventId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<EventDetail | undefined>(["event", eventId], updated);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useApproveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.approve(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
}

export function useRejectEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => eventsApi.reject(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.register(id),
    onSuccess: (_data, id) => queryClient.invalidateQueries({ queryKey: ["event", id] }),
  });
}

export function useUnregisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.unregister(id),
    onSuccess: (_data, id) => queryClient.invalidateQueries({ queryKey: ["event", id] }),
  });
}
