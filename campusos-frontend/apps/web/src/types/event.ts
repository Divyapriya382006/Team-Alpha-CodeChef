import type { EventType, EventStatus } from "./enums";

// Used in GET /events list results and inside Search results.
export interface EventSummary {
  id: string;
  clubId: string;
  title: string;
  description: string;
  location: string;
  type: EventType;
  capacity: number | null;
  registeredCount: number; // Finalized decision 6.4 — locked field name.
  startTime: string;
  endTime: string;
  status: EventStatus;
  createdAt: string;
}

// GET /events/:id — EventSummary + requestedBy, reviewedBy, rejectionReason (finalized decision 6.5).
export interface EventDetail extends EventSummary {
  requestedBy: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

// GET /events/:id/registrations — finalized decision 6.6. No department/phone.
export interface EventRegistrant {
  userId: string;
  name: string;
  email: string;
  registeredAt: string;
}
