import { del, get, post, USE_MOCK } from "../api";
import * as mock from "../mock/announcements";
import type { AnnouncementDetail, AnnouncementSummary, ListQuery, PaginatedData } from "../../types";

export type { CreateAnnouncementPayload } from "../mock/announcements";

export const announcementsApi = {
  create: (payload: mock.CreateAnnouncementPayload): Promise<{ id: string }> =>
    USE_MOCK ? mock.mockCreateAnnouncement(payload) : post("/announcements", payload),

  list: (params: ListQuery = {}): Promise<PaginatedData<AnnouncementSummary>> =>
    USE_MOCK ? mock.mockListAnnouncements(params) : get("/announcements", params),

  getOne: (id: string): Promise<AnnouncementDetail> =>
    USE_MOCK ? mock.mockGetAnnouncement(id) : get(`/announcements/${id}`),

  remove: (id: string): Promise<void> => (USE_MOCK ? mock.mockDeleteAnnouncement(id) : del(`/announcements/${id}`)),
};
