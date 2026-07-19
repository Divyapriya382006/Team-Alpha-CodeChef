import { del, get, post, USE_MOCK } from "../api";
import * as mock from "../mock/gallery";
import type { GalleryItem } from "../../types/gallery";
import type { Pagination } from "../../types";

export interface GalleryParams {
  clubId?: string;
  page?: number;
  limit?: number;
}

export const galleryApi = {
  list: (params: GalleryParams = {}): Promise<{ items: GalleryItem[]; pagination: Pagination }> =>
    USE_MOCK ? mock.mockListGalleryItems(params) : get("/gallery", params as Record<string, unknown>),

  add: (clubId: string, payload: { imageUrl: string; caption?: string | null }, callerUser?: any): Promise<GalleryItem> =>
    USE_MOCK
      ? mock.mockAddGalleryItem(clubId, payload, callerUser || { id: "user-1", name: "Mock User", email: "mock@example.com" })
      : post(`/clubs/${clubId}/gallery`, payload),

  delete: (id: string): Promise<void> =>
    USE_MOCK ? mock.mockDeleteGalleryItem(id).then(() => {}) : del(`/gallery/${id}`),
};
