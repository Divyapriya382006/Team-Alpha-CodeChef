import { ApiError } from "../apiError";
import {
  delay,
  getMockCaller,
  mockClubMembershipsDb,
  mockClubRequestsDb,
  mockClubsDb,
  nextId,
  paginate,
  type MockClubRecord,
  type MockClubRequestRecord,
} from "./db";
import type { ClubRequest, ClubRequestDetail, ListQuery, PaginatedData, RequestStatus } from "../../types";

function toClubRequest(record: MockClubRequestRecord): ClubRequest {
  return {
    id: record.id,
    clubName: record.clubName,
    description: record.description,
    facultyDetails: record.facultyDetails,
    reason: record.reason,
    requestedBy: record.requestedBy,
    status: record.status,
    createdAt: record.createdAt,
  };
}

function requireSuperAdmin() {
  const caller = getMockCaller();
  if (!caller || caller.platformRole !== "SUPER_ADMIN") {
    throw new ApiError("Caller is not a Super Admin", 403);
  }
  return caller;
}

export interface SubmitClubRequestPayload {
  clubName: string;
  description: string;
  facultyDetails: string;
  reason: string;
}

export async function mockSubmitClubRequest(payload: SubmitClubRequestPayload): Promise<{ id: string; status: "PENDING" }> {
  const caller = getMockCaller();
  if (!caller) {
    await delay(null, 200);
    throw new ApiError("Authentication required", 401);
  }

  const errors: Record<string, string> = {};
  if (!payload.clubName?.trim()) errors.clubName = "clubName is required";
  else if (payload.clubName.length > 100) errors.clubName = "clubName must be 100 characters or fewer";
  if (!payload.description?.trim()) errors.description = "description is required";
  if (!payload.facultyDetails?.trim()) errors.facultyDetails = "facultyDetails is required";
  if (!payload.reason?.trim()) errors.reason = "reason is required";
  if (Object.keys(errors).length > 0) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, errors);
  }

  const record: MockClubRequestRecord = {
    id: nextId("req"),
    clubName: payload.clubName,
    description: payload.description,
    facultyDetails: payload.facultyDetails,
    reason: payload.reason,
    requestedBy: caller.id,
    status: "PENDING",
    reviewedBy: null,
    rejectionReason: null,
    createdAt: new Date().toISOString(),
  };
  mockClubRequestsDb.push(record);
  return delay({ id: record.id, status: "PENDING" });
}

export interface ListClubRequestsParams extends ListQuery {
  status?: RequestStatus;
}

export async function mockListClubRequests(params: ListClubRequestsParams = {}): Promise<PaginatedData<ClubRequest>> {
  try {
    requireSuperAdmin();
  } catch (err) {
    await delay(null, 200);
    throw err;
  }
  let results = mockClubRequestsDb;
  if (params.status) results = results.filter((r) => r.status === params.status);
  return delay(paginate(results.map(toClubRequest), params.page ?? 1, params.limit ?? 20));
}

export async function mockGetClubRequest(id: string): Promise<ClubRequestDetail> {
  const caller = getMockCaller();
  const record = mockClubRequestsDb.find((r) => r.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Request not found", 404);
  }
  const isSuperAdmin = caller?.platformRole === "SUPER_ADMIN";
  const isRequester = caller?.id === record.requestedBy;
  if (!caller || (!isSuperAdmin && !isRequester)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither Super Admin nor the requester", 403);
  }
  return delay({ ...toClubRequest(record), reviewedBy: record.reviewedBy, rejectionReason: record.rejectionReason });
}

export async function mockApproveClubRequest(
  id: string,
  facultyCoordinatorId: string,
): Promise<{ clubId: string; requestId: string; status: "APPROVED" }> {
  let caller;
  try {
    caller = requireSuperAdmin();
  } catch (err) {
    await delay(null, 200);
    throw err;
  }
  const record = mockClubRequestsDb.find((r) => r.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Request not found", 404);
  }
  if (record.status !== "PENDING") {
    await delay(null, 200);
    throw new ApiError("Request is not PENDING", 400);
  }
  // Checked in order per FINAL_API_CONTRACT.md: duplicate name first, then coordinator conflict.
  const duplicateName = mockClubsDb.some((c) => c.name.toLowerCase() === record.clubName.toLowerCase());
  if (duplicateName) {
    await delay(null, 200);
    throw new ApiError("Duplicate club name", 409);
  }
  const coordinatorConflict = mockClubsDb.some((c) => c.facultyCoordinatorId === facultyCoordinatorId);
  if (coordinatorConflict) {
    await delay(null, 200);
    throw new ApiError("facultyCoordinatorId already coordinates another club", 409);
  }

  // Club creation, Club Head membership, and marking the request APPROVED all happen together —
  // the mock's equivalent of the single-transaction requirement in FINAL_TEAM_BUILD_GUIDE.md.
  const club: MockClubRecord = {
    id: nextId("club"),
    name: record.clubName,
    description: record.description,
    facultyDetails: record.facultyDetails,
    socialLinks: {},
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId,
    createdAt: new Date().toISOString(),
  };
  mockClubsDb.push(club);
  mockClubMembershipsDb.push({
    userId: record.requestedBy,
    clubId: club.id,
    role: "CLUB_HEAD",
    joinedAt: new Date().toISOString(),
  });
  record.status = "APPROVED";
  record.reviewedBy = caller.id;

  return delay({ clubId: club.id, requestId: record.id, status: "APPROVED" });
}

export async function mockRejectClubRequest(id: string, reason?: string): Promise<{ id: string; status: "REJECTED" }> {
  let caller;
  try {
    caller = requireSuperAdmin();
  } catch (err) {
    await delay(null, 200);
    throw err;
  }
  const record = mockClubRequestsDb.find((r) => r.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Request not found", 404);
  }
  if (record.status !== "PENDING") {
    await delay(null, 200);
    throw new ApiError("Request is not PENDING", 400);
  }
  record.status = "REJECTED";
  record.reviewedBy = caller.id;
  record.rejectionReason = reason ?? null;
  return delay({ id: record.id, status: "REJECTED" });
}

export async function mockWithdrawClubRequest(id: string): Promise<void> {
  const caller = getMockCaller();
  const record = mockClubRequestsDb.find((r) => r.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Request not found", 404);
  }
  if (caller?.id !== record.requestedBy) {
    await delay(null, 200);
    throw new ApiError("Caller is not the requester", 403);
  }
  if (record.status !== "PENDING") {
    await delay(null, 200);
    throw new ApiError("Request is not PENDING", 400);
  }
  const idx = mockClubRequestsDb.indexOf(record);
  mockClubRequestsDb.splice(idx, 1);
  await delay(undefined);
}
