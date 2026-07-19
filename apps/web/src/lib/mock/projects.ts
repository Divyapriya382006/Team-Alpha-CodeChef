import { ApiError } from "../apiError";
import {
  delay,
  getMockCaller,
  mockClubMembershipsDb,
  mockDepartmentsDb,
  mockProjectsDb,
  nextId,
  paginate,
  type MockProjectRecord,
} from "./db";
import type { ListQuery, PaginatedData, ProjectDetail, ProjectStatus, ProjectSummary } from "../../types";

const URL_PATTERN = /^https?:\/\//;

export interface ListProjectsParams extends ListQuery {
  search?: string;
  clubId?: string;
}

export interface ProjectPayload {
  title: string;
  description: string;
  techStack: string[];
  githubLink: string | null;
  demoLink: string | null;
  thumbnailUrl: string | null;
  contributors: string[];
  status: ProjectStatus;
  departmentId: string | null;
}

export type CreateProjectPayload = ProjectPayload;
export type EditProjectPayload = Partial<ProjectPayload>;

function toSummary(record: MockProjectRecord): ProjectSummary {
  return {
    id: record.id,
    clubId: record.clubId,
    departmentId: record.departmentId,
    title: record.title,
    description: record.description,
    techStack: record.techStack,
    thumbnailUrl: record.thumbnailUrl,
    status: record.status,
    createdAt: record.createdAt,
  };
}

function toDetail(record: MockProjectRecord): ProjectDetail {
  return {
    ...toSummary(record),
    githubLink: record.githubLink,
    demoLink: record.demoLink,
    contributors: record.contributors,
    createdBy: record.createdBy,
  };
}

// Club Head or Department Head of this club — resolved server-side against the real membership
// and department tables, unlike the frontend's route-level check (see lib/permissions.ts) which
// can't see department headship at all.
function isClubHeadOrDeptHead(clubId: string, userId: string): boolean {
  const isHead = mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === userId && m.role === "CLUB_HEAD");
  const isDeptHead = mockDepartmentsDb.some((d) => d.clubId === clubId && d.headUserId === userId);
  return isHead || isDeptHead;
}

function validateProjectFields(clubId: string, payload: Partial<ProjectPayload>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (payload.title !== undefined && !payload.title.trim()) errors.title = "title is required";
  if (payload.description !== undefined && !payload.description.trim()) errors.description = "description is required";
  if (payload.githubLink && !URL_PATTERN.test(payload.githubLink)) errors.githubLink = "Must be a valid http(s) URL";
  if (payload.demoLink && !URL_PATTERN.test(payload.demoLink)) errors.demoLink = "Must be a valid http(s) URL";
  if (payload.thumbnailUrl && !URL_PATTERN.test(payload.thumbnailUrl)) errors.thumbnailUrl = "Must be a valid http(s) URL";
  if (payload.departmentId) {
    const dept = mockDepartmentsDb.find((d) => d.id === payload.departmentId);
    if (!dept || dept.clubId !== clubId) errors.departmentId = "departmentId belongs to a different club";
  }
  return errors;
}

export async function mockListProjects(params: ListProjectsParams = {}): Promise<PaginatedData<ProjectSummary>> {
  let results = mockProjectsDb;
  if (params.clubId) results = results.filter((p) => p.clubId === params.clubId);
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter((p) => p.title.toLowerCase().includes(q));
  }
  return delay(paginate(results.map(toSummary), params.page ?? 1, params.limit ?? 20));
}

export async function mockGetProject(id: string): Promise<ProjectDetail> {
  const record = mockProjectsDb.find((p) => p.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Project not found", 404);
  }
  return delay(toDetail(record));
}

export async function mockCreateProject(clubId: string, payload: CreateProjectPayload): Promise<{ id: string }> {
  const caller = getMockCaller();
  if (!caller || !isClubHeadOrDeptHead(clubId, caller.id)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither this club's Club Head nor a Department Head of this club", 403);
  }
  const errors = validateProjectFields(clubId, payload);
  if (Object.keys(errors).length > 0) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, errors);
  }
  const record: MockProjectRecord = {
    id: nextId("project"),
    clubId,
    departmentId: payload.departmentId,
    title: payload.title,
    description: payload.description,
    techStack: payload.techStack,
    githubLink: payload.githubLink,
    demoLink: payload.demoLink,
    thumbnailUrl: payload.thumbnailUrl,
    contributors: payload.contributors,
    status: payload.status,
    createdBy: caller.id,
    createdAt: new Date().toISOString(),
  };
  mockProjectsDb.push(record);
  return delay({ id: record.id });
}

export async function mockEditProject(id: string, payload: EditProjectPayload): Promise<ProjectDetail> {
  const record = mockProjectsDb.find((p) => p.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Project not found", 404);
  }
  const caller = getMockCaller();
  const isCreator = caller?.id === record.createdBy;
  const isHead = !!caller && mockClubMembershipsDb.some((m) => m.clubId === record.clubId && m.userId === caller.id && m.role === "CLUB_HEAD");
  if (!caller || (!isCreator && !isHead)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither the creator nor this club's Club Head", 403);
  }
  const errors = validateProjectFields(record.clubId, payload);
  if (Object.keys(errors).length > 0) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, errors);
  }
  Object.assign(record, payload);
  return delay(toDetail(record));
}

export async function mockDeleteProject(id: string): Promise<void> {
  const record = mockProjectsDb.find((p) => p.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Project not found", 404);
  }
  const caller = getMockCaller();
  const isCreator = caller?.id === record.createdBy;
  const isHead = !!caller && mockClubMembershipsDb.some((m) => m.clubId === record.clubId && m.userId === caller.id && m.role === "CLUB_HEAD");
  if (!caller || (!isCreator && !isHead)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither the creator nor this club's Club Head", 403);
  }
  const idx = mockProjectsDb.indexOf(record);
  mockProjectsDb.splice(idx, 1);
  await delay(undefined);
}
