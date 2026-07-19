import { del, get, patch, post, USE_MOCK } from "../api";
import * as mock from "../mock/events";
import type { EventDetail, EventSummary, PaginatedData } from "../../types";

export type { CreateEventPayload, EditEventPayload, ListEventsParams } from "../mock/events";

// Every literal endpoint path lives here — hooks and pages call this object, never fetch/axios
// directly, so nothing outside this file needs to know a real URL.
export const eventsApi = {
  list: (params: mock.ListEventsParams = {}): Promise<PaginatedData<EventSummary>> =>
    USE_MOCK ? mock.mockListEvents(params) : get("/events", params),

  get: (id: string): Promise<EventDetail> => (USE_MOCK ? mock.mockGetEvent(id) : get(`/events/${id}`)),

  create: (clubId: string, payload: mock.CreateEventPayload): Promise<{ id: string; status: "PENDING" }> =>
    USE_MOCK ? mock.mockCreateEvent(clubId, payload) : post(`/clubs/${clubId}/events`, payload),

  edit: (clubId: string, eventId: string, payload: mock.EditEventPayload): Promise<EventDetail> =>
    USE_MOCK ? mock.mockEditEvent(clubId, eventId, payload) : patch(`/clubs/${clubId}/events/${eventId}`, payload),

  approve: (id: string): Promise<{ id: string; status: "APPROVED" }> =>
    USE_MOCK ? mock.mockApproveEvent(id) : patch(`/events/${id}/approve`),

  reject: (id: string, reason?: string): Promise<{ id: string; status: "REJECTED" }> =>
    USE_MOCK ? mock.mockRejectEvent(id, reason) : patch(`/events/${id}/reject`, { reason }),

  register: (id: string): Promise<{ eventId: string; userId: string }> =>
    USE_MOCK ? mock.mockRegisterForEvent(id) : post(`/events/${id}/register`),

  unregister: (id: string): Promise<void> => (USE_MOCK ? mock.mockUnregisterFromEvent(id) : del(`/events/${id}/register`)),
};
