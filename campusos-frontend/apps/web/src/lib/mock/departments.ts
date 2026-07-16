import { ApiError } from "../apiError";
import {
  delay,
  getMockCaller,
  mockClubMembershipsDb,
  mockDepartmentMembershipsDb,
  mockDepartmentsDb,
  mockUsersDb,
  nextId,
} from "./db";
import type { Department, DepartmentDetail, DepartmentMember, DepartmentSummary } from "../../types";

function isClubHead(clubId: string, userId: string): boolean {
  return mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === userId && m.role === "CLUB_HEAD");
}

function isDeptHead(departmentId: string, userId: string): boolean {
  const dept = mockDepartmentsDb.find((d) => d.id === departmentId);
  return !!dept && dept.headUserId === userId;
}

export async function mockListDepartments(clubId: string): Promise<DepartmentSummary[]> {
  return delay(mockDepartmentsDb.filter((d) => d.clubId === clubId).map((d) => ({ id: d.id, name: d.name })));
}

export async function mockCreateDepartment(clubId: string, name: string): Promise<{ id: string; clubId: string; name: string }> {
  const caller = getMockCaller();
  if (!caller || !isClubHead(clubId, caller.id)) {
    await delay(null, 200);
    throw new ApiError("Caller is not this club's Club Head", 403);
  }
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, { name: "Must be 2–50 characters" });
  }
  const duplicate = mockDepartmentsDb.some((d) => d.clubId === clubId && d.name.toLowerCase() === trimmed.toLowerCase());
  if (duplicate) {
    await delay(null, 200);
    throw new ApiError("Department name already exists in this club", 409);
  }
  const record = { id: nextId("dept"), clubId, name: trimmed, headUserId: null, createdAt: new Date().toISOString() };
  mockDepartmentsDb.push(record);
  return delay({ id: record.id, clubId: record.clubId, name: record.name });
}

export async function mockGetDepartment(id: string): Promise<DepartmentDetail> {
  const record = mockDepartmentsDb.find((d) => d.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Department not found", 404);
  }
  const caller = getMockCaller();
  const allowed = !!caller && (isClubHead(record.clubId, caller.id) || isDeptHead(id, caller.id) || caller.platformRole === "SUPER_ADMIN");
  if (!allowed) {
    await delay(null, 200);
    throw new ApiError("Caller is not this club's Club Head, this department's Head, or a Super Admin", 403);
  }
  const members: DepartmentMember[] = mockDepartmentMembershipsDb
    .filter((dm) => dm.departmentId === id)
    .map((dm) => {
      const user = mockUsersDb.find((u) => u.id === dm.userId)!;
      return { userId: user.id, name: user.name };
    });
  return delay({ id: record.id, clubId: record.clubId, name: record.name, headUserId: record.headUserId, createdAt: record.createdAt, members });
}

export async function mockSetDepartmentHead(id: string, userId: string | null): Promise<Department> {
  const record = mockDepartmentsDb.find((d) => d.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Department not found", 404);
  }
  const caller = getMockCaller();
  if (!caller || !isClubHead(record.clubId, caller.id)) {
    await delay(null, 200);
    throw new ApiError("Caller is not this club's Club Head", 403);
  }
  if (userId !== null) {
    const isMember = mockDepartmentMembershipsDb.some((dm) => dm.departmentId === id && dm.userId === userId);
    if (!isMember) {
      await delay(null, 200);
      throw new ApiError("Target user is not already a department member", 400);
    }
  }
  record.headUserId = userId;
  return delay({ id: record.id, clubId: record.clubId, name: record.name, headUserId: record.headUserId, createdAt: record.createdAt });
}

// Add/remove member permission is "Club Head OR that department's Head" per FINAL_API_CONTRACT.md.
// A plain Department Head (a MEMBER, not also a Club Head) is not in GET /users' allowed caller
// list (Club Head, Faculty Coordinator, Super Admin only) — so a Department Head can use these two
// write endpoints directly, but can't discover new candidates via the search UI. That's a real
// cross-module contract inconsistency, not something invented here.
export async function mockAddDepartmentMember(departmentId: string, userId: string): Promise<{ userId: string; departmentId: string }> {
  const record = mockDepartmentsDb.find((d) => d.id === departmentId);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Department not found", 404);
  }
  const caller = getMockCaller();
  if (!caller || (!isClubHead(record.clubId, caller.id) && !isDeptHead(departmentId, caller.id))) {
    await delay(null, 200);
    throw new ApiError("Caller is neither this club's Club Head nor this department's Head", 403);
  }
  const isClubMember = mockClubMembershipsDb.some((m) => m.clubId === record.clubId && m.userId === userId);
  if (!isClubMember) {
    await delay(null, 200);
    throw new ApiError("User must be a club member first", 400);
  }
  if (mockDepartmentMembershipsDb.some((dm) => dm.departmentId === departmentId && dm.userId === userId)) {
    await delay(null, 200);
    throw new ApiError("User is already a member of this department", 409);
  }
  mockDepartmentMembershipsDb.push({ userId, departmentId, joinedAt: new Date().toISOString() });
  return delay({ userId, departmentId });
}

export async function mockRemoveDepartmentMember(departmentId: string, userId: string): Promise<void> {
  const record = mockDepartmentsDb.find((d) => d.id === departmentId);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Department not found", 404);
  }
  const caller = getMockCaller();
  if (!caller || (!isClubHead(record.clubId, caller.id) && !isDeptHead(departmentId, caller.id))) {
    await delay(null, 200);
    throw new ApiError("Caller is neither this club's Club Head nor this department's Head", 403);
  }
  const idx = mockDepartmentMembershipsDb.findIndex((dm) => dm.departmentId === departmentId && dm.userId === userId);
  if (idx !== -1) mockDepartmentMembershipsDb.splice(idx, 1);
  // Removing the current head — via club-wide or direct department removal — clears headUserId.
  if (record.headUserId === userId) record.headUserId = null;
  await delay(undefined);
}
