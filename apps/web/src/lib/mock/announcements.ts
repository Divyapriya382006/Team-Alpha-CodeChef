import { ApiError } from "../apiError";
import {
  delay,
  getMockCaller,
  mockAnnouncementsDb,
  mockClubMembershipsDb,
  mockDepartmentMembershipsDb,
  mockDepartmentsDb,
  nextId,
  paginate,
  type MockAnnouncementRecord,
} from "./db";
import type { AnnouncementDetail, AnnouncementSummary, AnnouncementVisibility, ListQuery, PaginatedData } from "../../types";

function toSummary(record: MockAnnouncementRecord): AnnouncementSummary {
  return {
    id: record.id,
    title: record.title,
    visibility: record.visibility,
    clubId: record.clubId,
    departmentId: record.departmentId,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
  };
}

function toDetail(record: MockAnnouncementRecord): AnnouncementDetail {
  return { ...toSummary(record), content: record.content };
}

function isVisibleTo(record: MockAnnouncementRecord, callerId: string | undefined): boolean {
  if (record.visibility === "GLOBAL") return true;
  if (!callerId) return false;
  if (record.visibility === "CLUB") {
    return mockClubMembershipsDb.some((m) => m.userId === callerId && m.clubId === record.clubId);
  }
  return mockDepartmentMembershipsDb.some((dm) => dm.userId === callerId && dm.departmentId === record.departmentId);
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  visibility: AnnouncementVisibility;
  clubId?: string | null;
  departmentId?: string | null;
}

export async function mockCreateAnnouncement(payload: CreateAnnouncementPayload): Promise<{ id: string }> {
  const caller = getMockCaller();
  if (!caller) {
    await delay(null, 200);
    throw new ApiError("Authentication required", 401);
  }

  if (!payload.title?.trim() || !payload.content?.trim()) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, {
      ...(payload.title?.trim() ? {} : { title: "title is required" }),
      ...(payload.content?.trim() ? {} : { content: "content is required" }),
    });
  }

  let clubId: string | null = null;
  let departmentId: string | null = null;

  if (payload.visibility === "GLOBAL") {
    if (payload.clubId || payload.departmentId) {
      await delay(null, 200);
      throw new ApiError("GLOBAL visibility must not include a clubId or departmentId", 400);
    }
    if (caller.platformRole !== "SUPER_ADMIN") {
      await delay(null, 200);
      throw new ApiError("Caller lacks the required scope for GLOBAL visibility", 403);
    }
  } else if (payload.visibility === "CLUB") {
    if (!payload.clubId) {
      await delay(null, 200);
      throw new ApiError("clubId is required for CLUB visibility", 400);
    }
    const isHead = mockClubMembershipsDb.some((m) => m.clubId === payload.clubId && m.userId === caller.id && m.role === "CLUB_HEAD");
    if (!isHead) {
      await delay(null, 200);
      throw new ApiError("Caller lacks the required scope for CLUB visibility", 403);
    }
    clubId = payload.clubId;
  } else {
    if (!payload.departmentId) {
      await delay(null, 200);
      throw new ApiError("departmentId is required for DEPARTMENT visibility", 400);
    }
    const dept = mockDepartmentsDb.find((d) => d.id === payload.departmentId);
    if (!dept || dept.headUserId !== caller.id) {
      await delay(null, 200);
      throw new ApiError("Caller lacks the required scope for DEPARTMENT visibility", 403);
    }
    departmentId = dept.id;
    // clubId is always derived server-side from the department's own club — never trust a
    // client-supplied clubId, per FINAL_API_CONTRACT.md.
    clubId = dept.clubId;
  }

  const record: MockAnnouncementRecord = {
    id: nextId("announce"),
    title: payload.title,
    content: payload.content,
    visibility: payload.visibility,
    clubId,
    departmentId,
    createdBy: caller.id,
    createdAt: new Date().toISOString(),
  };
  mockAnnouncementsDb.push(record);
  return delay({ id: record.id });
}

export async function mockListAnnouncements(params: ListQuery = {}): Promise<PaginatedData<AnnouncementSummary>> {
  const caller = getMockCaller();
  if (!caller) {
    await delay(null, 200);
    throw new ApiError("Authentication required", 401);
  }
  // Auto-filtered per FINAL_TEAM_BUILD_GUIDE.md: all GLOBAL + CLUB announcements for clubs the
  // caller belongs to + DEPARTMENT announcements for departments the caller belongs to.
  const visible = mockAnnouncementsDb.filter((a) => isVisibleTo(a, caller.id));
  return delay(paginate(visible.map(toSummary), params.page ?? 1, params.limit ?? 20));
}

export async function mockGetAnnouncement(id: string): Promise<AnnouncementDetail> {
  const caller = getMockCaller();
  const record = mockAnnouncementsDb.find((a) => a.id === id);
  // 404, never 403, when not visible — avoids confirming the announcement's existence.
  if (!record || !isVisibleTo(record, caller?.id)) {
    await delay(null, 200);
    throw new ApiError("Announcement not found", 404);
  }
  return delay(toDetail(record));
}

export async function mockDeleteAnnouncement(id: string): Promise<void> {
  const caller = getMockCaller();
  const record = mockAnnouncementsDb.find((a) => a.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Announcement not found", 404);
  }
  const isCreator = caller?.id === record.createdBy;
  const isSuperAdmin = caller?.platformRole === "SUPER_ADMIN";
  const isClubHead =
    !!record.clubId && !!caller && mockClubMembershipsDb.some((m) => m.clubId === record.clubId && m.userId === caller.id && m.role === "CLUB_HEAD");
  if (!caller || (!isCreator && !isSuperAdmin && !isClubHead)) {
    await delay(null, 200);
    throw new ApiError("Caller is none of: creator, Super Admin, or the announcement's club's Club Head", 403);
  }
  const idx = mockAnnouncementsDb.indexOf(record);
  mockAnnouncementsDb.splice(idx, 1);
  await delay(undefined);
}
