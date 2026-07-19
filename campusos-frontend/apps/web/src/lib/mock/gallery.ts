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
  },
  {
    id: "gallery-5",
    clubId: "club-3", // Literary Society
    imageUrl: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=800&q=80",
    caption: "Readings from this semester's Literary Fest.",
    createdAt: "2026-07-14T11:00:00Z",
    createdBy: { id: "user-clubhead-3", name: "Meera Joseph", email: "meera@campusos.edu" }
  },
  {
    id: "gallery-6",
    clubId: "club-4", // Music Society
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80",
    caption: "Open mic night at the Student Union.",
    createdAt: "2026-07-14T18:30:00Z",
    createdBy: { id: "user-clubhead-4", name: "Ishaan Kapoor", email: "ishaan@campusos.edu" }
  },
  {
    id: "gallery-7",
    clubId: "club-5", // Coding Club
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    caption: "Overnight hackathon in the CS building.",
    createdAt: "2026-07-15T09:00:00Z",
    createdBy: { id: "user-clubhead-5", name: "Naina Bhatt", email: "naina@campusos.edu" }
  },
  {
    id: "gallery-8",
    clubId: "club-6", // Dance Crew
    imageUrl: "https://images.unsplash.com/photo-1561489401-fc2876ced162?auto=format&fit=crop&w=800&q=80",
    caption: "Rehearsal for the Winter Showcase.",
    createdAt: "2026-07-15T17:00:00Z",
    createdBy: { id: "user-clubhead-6", name: "Rohan Verma", email: "rohan@campusos.edu" }
  },
  {
    id: "gallery-9",
    clubId: "club-7", // Entrepreneurship Cell
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    caption: "Pitch workshop with student founders.",
    createdAt: "2026-07-16T14:00:00Z",
    createdBy: { id: "user-clubhead-7", name: "Kavya Iyer", email: "kavya@campusos.edu" }
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
