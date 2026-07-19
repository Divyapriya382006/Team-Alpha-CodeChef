import { ApiError } from "../apiError";
import {
  delay,
  getMockCaller,
  mockClubMembershipsDb,
  mockClubsDb,
  mockEventsDb,
  nextId,
  paginate,
  type MockEventRecord,
} from "./db";
import type { EventDetail, EventStatus, EventSummary, EventType, ListQuery, PaginatedData } from "../../types";

export interface ListEventsParams extends ListQuery {
  search?: string;
  status?: EventStatus;
  type?: EventType;
  clubId?: string;
}

export interface EventPayload {
  title: string;
  description: string;
  type: EventType;
  capacity: number | null;
  location: string;
  startTime: string;
  endTime: string;
}

export type CreateEventPayload = EventPayload;
export type EditEventPayload = Partial<EventPayload>;

function toSummary(record: MockEventRecord): EventSummary {
  return {
    id: record.id,
    clubId: record.clubId,
    title: record.title,
    description: record.description,
    location: record.location,
    type: record.type,
    capacity: record.capacity,
    registeredCount: record.registrations.length,
    startTime: record.startTime,
    endTime: record.endTime,
    status: record.status,
    createdAt: record.createdAt,
  };
}

function toDetail(record: MockEventRecord): EventDetail {
  return {
    ...toSummary(record),
    requestedBy: record.requestedBy,
    reviewedBy: record.reviewedBy,
    rejectionReason: record.rejectionReason,
  };
}

function validateEventFields(fields: { startTime?: string; endTime?: string; capacity?: number | null }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (fields.startTime && fields.endTime && new Date(fields.endTime) <= new Date(fields.startTime)) {
    errors.endTime = "endTime must be after startTime";
  }
  if (fields.capacity !== undefined && fields.capacity !== null && fields.capacity <= 0) {
    errors.capacity = "capacity must be null or greater than 0";
  }
  return errors;
}

// Minimal list-only endpoint — enough to power the Club Detail page's Events section ahead of
// the full Events module. Approval/registration mutations belong to that module, not this one.
export async function mockListEvents(params: ListEventsParams = {}): Promise<PaginatedData<EventSummary>> {
  const caller = getMockCaller();
  let results = mockEventsDb;

  if (params.clubId) results = results.filter((e) => e.clubId === params.clubId);
  if (params.type) results = results.filter((e) => e.type === params.type);
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter((e) => e.title.toLowerCase().includes(q));
  }

  if (params.status) {
    // Explicit status filters (e.g. the Faculty Approval Queue's status=PENDING&clubId=) bypass
    // the default visibility rule below — FINAL_API_CONTRACT.md doesn't restrict this endpoint
    // by status value on its own, so this mirrors that literally rather than adding an extra
    // permission check the contract doesn't specify.
    results = results.filter((e) => e.status === params.status);
  } else {
    // Default visibility per FINAL_API_CONTRACT.md: only APPROVED, and CLUB_EXCLUSIVE only
    // for members of that club.
    results = results.filter((e) => {
      if (e.status !== "APPROVED") return false;
      if (e.type === "PUBLIC") return true;
      return !!caller && mockClubMembershipsDb.some((m) => m.userId === caller.id && m.clubId === e.clubId);
    });
  }

  return delay(paginate(results.map(toSummary), params.page ?? 1, params.limit ?? 20));
}

export async function mockGetEvent(id: string): Promise<EventDetail> {
  const record = mockEventsDb.find((e) => e.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Event not found", 404);
  }
  return delay(toDetail(record));
}

export async function mockCreateEvent(clubId: string, payload: CreateEventPayload): Promise<{ id: string; status: "PENDING" }> {
  const caller = getMockCaller();
  const isHead = mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === caller?.id && m.role === "CLUB_HEAD");
  if (!caller || !isHead) {
    await delay(null, 200);
    throw new ApiError("Caller is not this club's Club Head", 403);
  }
  const errors = validateEventFields(payload);
  if (Object.keys(errors).length > 0) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, errors);
  }
  const record: MockEventRecord = {
    id: nextId("event"),
    clubId,
    title: payload.title,
    description: payload.description,
    location: payload.location,
    type: payload.type,
    capacity: payload.capacity,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: "PENDING",
    requestedBy: caller.id,
    reviewedBy: null,
    rejectionReason: null,
    createdAt: new Date().toISOString(),
    registrations: [],
  };
  mockEventsDb.push(record);
  return delay({ id: record.id, status: "PENDING" });
}

export async function mockEditEvent(clubId: string, eventId: string, payload: EditEventPayload): Promise<EventDetail> {
  const record = mockEventsDb.find((e) => e.id === eventId && e.clubId === clubId);
  // Not explicitly listed in this endpoint's error column (400, 403 only), but 404 for a missing
  // resource is the same global fallback used elsewhere in this module (approve/reject/register).
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Event not found", 404);
  }
  const caller = getMockCaller();
  const isHead = mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === caller?.id && m.role === "CLUB_HEAD");
  if (!caller || !isHead) {
    await delay(null, 200);
    throw new ApiError("Caller is not this club's Club Head", 403);
  }
  if (record.status === "APPROVED") {
    await delay(null, 200);
    throw new ApiError("APPROVED events cannot be edited", 400);
  }

  const merged = {
    startTime: payload.startTime ?? record.startTime,
    endTime: payload.endTime ?? record.endTime,
    capacity: payload.capacity !== undefined ? payload.capacity : record.capacity,
  };
  const errors = validateEventFields(merged);
  if (Object.keys(errors).length > 0) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, errors);
  }

  if (payload.title !== undefined) record.title = payload.title;
  if (payload.description !== undefined) record.description = payload.description;
  if (payload.type !== undefined) record.type = payload.type;
  if (payload.location !== undefined) record.location = payload.location;
  record.startTime = merged.startTime;
  record.endTime = merged.endTime;
  record.capacity = merged.capacity;
  // Editing resets the review cycle, per FINAL_TEAM_BUILD_GUIDE.md — clearing the prior
  // reviewedBy/rejectionReason so a stale rejection reason can't linger on a re-submitted event.
  record.status = "PENDING";
  record.reviewedBy = null;
  record.rejectionReason = null;

  return delay(toDetail(record));
}

export async function mockApproveEvent(id: string): Promise<{ id: string; status: "APPROVED" }> {
  const record = mockEventsDb.find((e) => e.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Event not found", 404);
  }
  const caller = getMockCaller();
  const club = mockClubsDb.find((c) => c.id === record.clubId);
  const isCoordinator = !!caller && club?.facultyCoordinatorId === caller.id;
  if (!caller || !isCoordinator) {
    await delay(null, 200);
    throw new ApiError("Caller is not the Faculty Coordinator of this club", 403);
  }
  if (record.status !== "PENDING") {
    await delay(null, 200);
    throw new ApiError("Event is not PENDING", 400);
  }
  record.status = "APPROVED";
  record.reviewedBy = caller.id;
  record.rejectionReason = null;
  return delay({ id: record.id, status: "APPROVED" });
}

export async function mockRejectEvent(id: string, reason?: string): Promise<{ id: string; status: "REJECTED" }> {
  const record = mockEventsDb.find((e) => e.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Event not found", 404);
  }
  const caller = getMockCaller();
  const club = mockClubsDb.find((c) => c.id === record.clubId);
  const isCoordinator = !!caller && club?.facultyCoordinatorId === caller.id;
  if (!caller || !isCoordinator) {
    await delay(null, 200);
    throw new ApiError("Caller is not the Faculty Coordinator of this club", 403);
  }
  if (record.status !== "PENDING") {
    await delay(null, 200);
    throw new ApiError("Event is not PENDING", 400);
  }
  record.status = "REJECTED";
  record.reviewedBy = caller.id;
  record.rejectionReason = reason ?? null;
  return delay({ id: record.id, status: "REJECTED" });
}

export async function mockRegisterForEvent(id: string): Promise<{ eventId: string; userId: string }> {
  const caller = getMockCaller();
  if (!caller) {
    await delay(null, 200);
    throw new ApiError("Authentication required", 401);
  }
  const record = mockEventsDb.find((e) => e.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Event not found", 404);
  }
  if (record.status !== "APPROVED") {
    await delay(null, 200);
    throw new ApiError("Event is not approved", 400);
  }
  if (record.capacity !== null && record.registrations.length >= record.capacity) {
    await delay(null, 200);
    throw new ApiError("Event is full", 400);
  }
  if (
    record.type === "CLUB_EXCLUSIVE" &&
    !mockClubMembershipsDb.some((m) => m.userId === caller.id && m.clubId === record.clubId)
  ) {
    await delay(null, 200);
    throw new ApiError("Event is CLUB_EXCLUSIVE and caller is not a member of that club", 403);
  }
  if (record.registrations.includes(caller.id)) {
    await delay(null, 200);
    throw new ApiError("Caller is already registered for this event", 409);
  }
  // Capacity check and insert happen in the same synchronous pass — the mock's equivalent of the
  // single-transaction requirement in FINAL_TEAM_BUILD_GUIDE.md (no separate read-then-write).
  record.registrations.push(caller.id);
  return delay({ eventId: record.id, userId: caller.id });
}

export async function mockUnregisterFromEvent(id: string): Promise<void> {
  const caller = getMockCaller();
  if (!caller) {
    await delay(null, 200);
    throw new ApiError("Authentication required", 401);
  }
  const record = mockEventsDb.find((e) => e.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Event not found", 404);
  }
  const idx = record.registrations.indexOf(caller.id);
  if (idx === -1) {
    await delay(null, 200);
    throw new ApiError("Caller is not registered for this event", 404);
  }
  record.registrations.splice(idx, 1);
  await delay(undefined);
}
