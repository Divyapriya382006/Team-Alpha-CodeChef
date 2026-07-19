import type { GalleryItem } from "../../types/gallery";
import { delay, paginate } from "./db";

export interface GalleryParams {
  clubId?: string;
  page?: number;
  limit?: number;
}

// In-memory mock database of gallery items
export let mockGalleryDb: GalleryItem[] = [
  {
    id: "gallery-1",
    clubId: "club-1", // Robotics Club
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    caption: "Working on the hardware chassis for the annual robotics challenge.",
    createdAt: "2026-07-10T10:00:00Z",
    createdBy: { id: "user-4", name: "Grace Kim", email: "grace@campusos.edu" }
  },
  {
    id: "gallery-2",
    clubId: "club-1",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    caption: "Wiring testing phase for our autonomous drone project.",
    createdAt: "2026-07-11T14:30:00Z",
    createdBy: { id: "user-4", name: "Grace Kim", email: "grace@campusos.edu" }
  },
  {
    id: "gallery-3",
    clubId: "club-2", // Web Dev Club
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    caption: "Coding sprint for the CampusOS portal frontend layout.",
    createdAt: "2026-07-12T09:00:00Z",
    createdBy: { id: "user-5", name: "Henry Patel", email: "henry@campusos.edu" }
  },
  {
    id: "gallery-4",
    clubId: "club-2",
    imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    caption: "Design feedback session using Figma prototypes.",
    createdAt: "2026-07-13T16:00:00Z",
    createdBy: { id: "user-5", name: "Henry Patel", email: "henry@campusos.edu" }
  }
];

export async function mockListGalleryItems(params: GalleryParams = {}) {
  let entries = [...mockGalleryDb];
  if (params.clubId) {
    entries = entries.filter((e) => e.clubId === params.clubId);
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const { items, pagination } = paginate(entries, page, limit);
  return delay({ items, pagination });
}

export async function mockAddGalleryItem(clubId: string, payload: { imageUrl: string; caption?: string | null }, caller: { id: string; name: string; email: string }) {
  const newItem: GalleryItem = {
    id: `gallery-${Date.now()}`,
    clubId,
    imageUrl: payload.imageUrl,
    caption: payload.caption ?? null,
    createdAt: new Date().toISOString(),
    createdBy: {
      id: caller.id,
      name: caller.name,
      email: caller.email
    }
  };
  mockGalleryDb.unshift(newItem);
  return delay(newItem);
}

export async function mockDeleteGalleryItem(id: string) {
  mockGalleryDb = mockGalleryDb.filter((e) => e.id !== id);
  return delay(true);
}
