import { ApiError } from "../apiError";
import {
  delay,
  getMockCaller,
  mockClubMembershipsDb,
  mockClubsDb,
  mockUsersDb,
  paginate,
  type MockClubRecord,
} from "./db";
import type { Club, ClubDetail, ClubMember, ListQuery, PaginatedData, SocialLinks } from "../../types";
import { mockDepartmentsDb } from "./db";

const URL_PATTERN = /^https?:\/\//;

function toClub(record: MockClubRecord): Club {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    facultyDetails: record.facultyDetails,
    socialLinks: record.socialLinks,
    logoUrl: record.logoUrl,
    status: record.status,
    facultyCoordinatorId: record.facultyCoordinatorId,
    createdAt: record.createdAt,
  };
}

export interface ListClubsParams extends ListQuery {
  search?: string;
}

export async function mockListClubs(params: ListClubsParams = {}): Promise<PaginatedData<Club>> {
  const { search, page = 1, limit = 20 } = params;
  let results = mockClubsDb;
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((c) => c.name.toLowerCase().includes(q));
  }
  return delay(paginate(results.map(toClub), page, limit));
}

export async function mockGetClub(id: string): Promise<ClubDetail> {
  const record = mockClubsDb.find((c) => c.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Club not found", 404);
  }
  const departments = mockDepartmentsDb.filter((d) => d.clubId === id).map((d) => ({ id: d.id, name: d.name }));
  return delay({ ...toClub(record), departments });
}

export interface UpdateClubPayload {
  description?: string;
  facultyDetails?: string;
  socialLinks?: SocialLinks;
  logoUrl?: string | null;
}

function validateClubPatch(payload: UpdateClubPayload): Record<string, string> {
  const errors: Record<string, string> = {};
  if (payload.logoUrl && !URL_PATTERN.test(payload.logoUrl)) {
    errors.logoUrl = "Must be a valid http(s) URL";
  }
  if (payload.socialLinks) {
    for (const [key, value] of Object.entries(payload.socialLinks)) {
      if (value && !URL_PATTERN.test(value)) {
        errors[`socialLinks.${key}`] = "Must be a valid http(s) URL";
      }
    }
  }
  return errors;
}

export async function mockUpdateClub(id: string, payload: UpdateClubPayload): Promise<Club> {
  const record = mockClubsDb.find((c) => c.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Club not found", 404);
  }
  const caller = getMockCaller();
  const isHead = mockClubMembershipsDb.some((m) => m.clubId === id && m.userId === caller?.id && m.role === "CLUB_HEAD");
  const isSuperAdmin = caller?.platformRole === "SUPER_ADMIN";
  if (!caller || (!isHead && !isSuperAdmin)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither this club's Club Head nor a Super Admin", 403);
  }
  const errors = validateClubPatch(payload);
  if (Object.keys(errors).length > 0) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, errors);
  }
  if (payload.description !== undefined) record.description = payload.description;
  if (payload.facultyDetails !== undefined) record.facultyDetails = payload.facultyDetails;
  if (payload.logoUrl !== undefined) record.logoUrl = payload.logoUrl;
  if (payload.socialLinks !== undefined) record.socialLinks = payload.socialLinks;
  return delay(toClub(record));
}

export async function mockListClubMembers(clubId: string, params: ListQuery = {}): Promise<PaginatedData<ClubMember>> {
  const club = mockClubsDb.find((c) => c.id === clubId);
  if (!club) {
    await delay(null, 200);
    throw new ApiError("Club not found", 404);
  }
  const caller = getMockCaller();
  const memberships = mockClubMembershipsDb.filter((m) => m.clubId === clubId);
  const callerMembership = memberships.find((m) => m.userId === caller?.id);
  const isSuperAdmin = caller?.platformRole === "SUPER_ADMIN";
  if (!caller || (!callerMembership && !isSuperAdmin)) {
    await delay(null, 200);
    throw new ApiError("Caller is authenticated but not a member of this club", 403);
  }
  const includeEmail = isSuperAdmin || callerMembership?.role === "CLUB_HEAD";
  const items: ClubMember[] = memberships.map((m) => {
    const user = mockUsersDb.find((u) => u.id === m.userId)!;
    return includeEmail
      ? { userId: user.id, name: user.name, email: user.email, role: m.role }
      : { userId: user.id, name: user.name, role: m.role };
  });
  const { page = 1, limit = 20 } = params;
  return delay(paginate(items, page, limit));
}

export async function mockAddClubMember(clubId: string, userId: string): Promise<{ userId: string; clubId: string; role: "MEMBER" }> {
  const caller = getMockCaller();
  const isHead = mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === caller?.id && m.role === "CLUB_HEAD");
  if (!caller || !isHead) {
    await delay(null, 200);
    throw new ApiError("Caller is not this club's Club Head", 403);
  }
  const user = mockUsersDb.find((u) => u.id === userId);
  if (!user) {
    await delay(null, 200);
    throw new ApiError("userId doesn't exist", 404);
  }
  if (mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === userId)) {
    await delay(null, 200);
    throw new ApiError("User is already a member of this club", 409);
  }
  mockClubMembershipsDb.push({ userId, clubId, role: "MEMBER", joinedAt: new Date().toISOString() });
  return delay({ userId, clubId, role: "MEMBER" });
}

export async function mockRemoveClubMember(clubId: string, userId: string): Promise<void> {
  const caller = getMockCaller();
  const membership = mockClubMembershipsDb.find((m) => m.clubId === clubId && m.userId === userId);
  if (!membership) {
    await delay(null, 200);
    throw new ApiError("userId is not a member of this club", 404);
  }
  const callerMembership = mockClubMembershipsDb.find((m) => m.clubId === clubId && m.userId === caller?.id);
  const isHead = callerMembership?.role === "CLUB_HEAD";
  const isSelf = caller?.id === userId;
  if (!caller || (!isHead && !isSelf)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither this club's Club Head nor the member themself", 403);
  }
  if (membership.role === "CLUB_HEAD") {
    const otherHeads = mockClubMembershipsDb.filter((m) => m.clubId === clubId && m.role === "CLUB_HEAD" && m.userId !== userId);
    if (otherHeads.length === 0) {
      await delay(null, 200);
      throw new ApiError("Cannot remove sole Club Head", 400);
    }
  }
  const idx = mockClubMembershipsDb.indexOf(membership);
  mockClubMembershipsDb.splice(idx, 1);
  await delay(undefined);
}

export async function mockUpdateMemberRole(clubId: string, userId: string, role: "MEMBER"): Promise<{ userId: string; clubId: string; role: "MEMBER" }> {
  if (role !== "MEMBER") {
    await delay(null, 200);
    throw new ApiError("role value other than MEMBER was supplied", 400);
  }
  const caller = getMockCaller();
  const isHead = mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === caller?.id && m.role === "CLUB_HEAD");
  if (!caller || !isHead) {
    await delay(null, 200);
    throw new ApiError("Caller is not this club's Club Head", 403);
  }
  const membership = mockClubMembershipsDb.find((m) => m.clubId === clubId && m.userId === userId);
  if (!membership) {
    await delay(null, 200);
    throw new ApiError("Member not found", 404);
  }
  membership.role = "MEMBER";
  return delay({ userId, clubId, role: "MEMBER" });
}

// The only way a club's Club Head ever changes, per FINAL_TEAM_BUILD_GUIDE.md — demotes every
// current Club Head and promotes the incoming one in one atomic pass. Club Heads themselves
// cannot do this (mockUpdateMemberRole above is hard-locked to "MEMBER" only); it's Super-Admin-only.
export async function mockTransferClubHead(clubId: string, newClubHeadUserId: string): Promise<{ clubId: string; newClubHeadUserId: string }> {
  const caller = getMockCaller();
  if (!caller || caller.platformRole !== "SUPER_ADMIN") {
    await delay(null, 200);
    throw new ApiError("Caller is not a Super Admin", 403);
  }
  const club = mockClubsDb.find((c) => c.id === clubId);
  if (!club) {
    await delay(null, 200);
    throw new ApiError("Club or target user not found", 404);
  }
  const targetUser = mockUsersDb.find((u) => u.id === newClubHeadUserId);
  if (!targetUser) {
    await delay(null, 200);
    throw new ApiError("Club or target user not found", 404);
  }

  mockClubMembershipsDb.forEach((m) => {
    if (m.clubId === clubId && m.role === "CLUB_HEAD") m.role = "MEMBER";
  });
  const existingMembership = mockClubMembershipsDb.find((m) => m.clubId === clubId && m.userId === newClubHeadUserId);
  if (existingMembership) {
    existingMembership.role = "CLUB_HEAD";
  } else {
    mockClubMembershipsDb.push({ userId: newClubHeadUserId, clubId, role: "CLUB_HEAD", joinedAt: new Date().toISOString() });
  }

  return delay({ clubId, newClubHeadUserId });
}

export async function mockReassignFacultyCoordinator(clubId: string, facultyCoordinatorId: string): Promise<Club> {
  const caller = getMockCaller();
  if (!caller || caller.platformRole !== "SUPER_ADMIN") {
    await delay(null, 200);
    throw new ApiError("Caller is not a Super Admin", 403);
  }
  const club = mockClubsDb.find((c) => c.id === clubId);
  if (!club) {
    await delay(null, 200);
    throw new ApiError("Club not found", 404);
  }
  const conflict = mockClubsDb.some((c) => c.id !== clubId && c.facultyCoordinatorId === facultyCoordinatorId);
  if (conflict) {
    await delay(null, 200);
    throw new ApiError("Target user already coordinates another club", 409);
  }
  club.facultyCoordinatorId = facultyCoordinatorId;
  return delay(toClub(club));
}
