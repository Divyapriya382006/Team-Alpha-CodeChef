import type { AnnouncementVisibility } from "./enums";

// GET /announcements feed — excludes content.
export interface AnnouncementSummary {
  id: string;
  title: string;
  visibility: AnnouncementVisibility;
  clubId: string | null;
  departmentId: string | null;
  createdBy: string;
  createdAt: string;
}

// GET /announcements/:id — AnnouncementSummary + content.
export interface AnnouncementDetail extends AnnouncementSummary {
  content: string;
}
