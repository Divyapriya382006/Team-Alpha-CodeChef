import { ApiError } from "../apiError";
import { delay, getMockCaller, mockBlogsDb, mockClubMembershipsDb, mockDepartmentsDb, nextId, paginate, type MockBlogRecord } from "./db";
import type { BlogDetail, BlogSummary, ListQuery, PaginatedData } from "../../types";

const URL_PATTERN = /^https?:\/\//;

export interface ListBlogsParams extends ListQuery {
  search?: string;
  clubId?: string;
  tag?: string;
}

export interface BlogPayload {
  title: string;
  content: string;
  tags: string[];
  thumbnailUrl: string | null;
  departmentId: string | null;
}

export type CreateBlogPayload = BlogPayload;
export type EditBlogPayload = Partial<BlogPayload>;

function toSummary(record: MockBlogRecord): BlogSummary {
  return {
    id: record.id,
    clubId: record.clubId,
    departmentId: record.departmentId,
    title: record.title,
    tags: record.tags,
    thumbnailUrl: record.thumbnailUrl,
    authorId: record.authorId,
    publishedAt: record.publishedAt,
  };
}

function toDetail(record: MockBlogRecord): BlogDetail {
  return { ...toSummary(record), content: record.content };
}

// Club Head or Department Head of this club — same server-side resolution as Projects; the
// frontend route guard can only check the Club Head half (see lib/permissions.ts).
function isClubHeadOrDeptHead(clubId: string, userId: string): boolean {
  const isHead = mockClubMembershipsDb.some((m) => m.clubId === clubId && m.userId === userId && m.role === "CLUB_HEAD");
  const isDeptHead = mockDepartmentsDb.some((d) => d.clubId === clubId && d.headUserId === userId);
  return isHead || isDeptHead;
}

export async function mockListBlogs(params: ListBlogsParams = {}): Promise<PaginatedData<BlogSummary>> {
  let results = mockBlogsDb;
  if (params.clubId) results = results.filter((b) => b.clubId === params.clubId);
  if (params.tag) results = results.filter((b) => b.tags.includes(params.tag as string));
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter((b) => b.title.toLowerCase().includes(q));
  }
  return delay(paginate(results.map(toSummary), params.page ?? 1, params.limit ?? 20));
}

export async function mockGetBlog(id: string): Promise<BlogDetail> {
  const record = mockBlogsDb.find((b) => b.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Blog not found", 404);
  }
  return delay(toDetail(record));
}

export async function mockCreateBlog(clubId: string, payload: CreateBlogPayload): Promise<{ id: string }> {
  const caller = getMockCaller();
  if (!caller || !isClubHeadOrDeptHead(clubId, caller.id)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither this club's Club Head nor a Department Head of this club", 403);
  }
  if (!payload.title?.trim() || !payload.content?.trim()) {
    await delay(null, 200);
    throw new ApiError("Missing title or content", 400, {
      ...(payload.title?.trim() ? {} : { title: "title is required" }),
      ...(payload.content?.trim() ? {} : { content: "content is required" }),
    });
  }
  if (payload.thumbnailUrl && !URL_PATTERN.test(payload.thumbnailUrl)) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, { thumbnailUrl: "Must be a valid http(s) URL" });
  }
  const record: MockBlogRecord = {
    id: nextId("blog"),
    clubId,
    departmentId: payload.departmentId,
    title: payload.title,
    content: payload.content,
    authorId: caller.id,
    tags: payload.tags,
    thumbnailUrl: payload.thumbnailUrl,
    publishedAt: new Date().toISOString(),
  };
  mockBlogsDb.push(record);
  return delay({ id: record.id });
}

export async function mockEditBlog(id: string, payload: EditBlogPayload): Promise<BlogDetail> {
  const record = mockBlogsDb.find((b) => b.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Blog not found", 404);
  }
  const caller = getMockCaller();
  const isAuthor = caller?.id === record.authorId;
  const isHead = !!caller && mockClubMembershipsDb.some((m) => m.clubId === record.clubId && m.userId === caller.id && m.role === "CLUB_HEAD");
  if (!caller || (!isAuthor && !isHead)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither the author nor this club's Club Head", 403);
  }
  if (payload.thumbnailUrl && !URL_PATTERN.test(payload.thumbnailUrl)) {
    await delay(null, 200);
    throw new ApiError("Validation failed", 400, { thumbnailUrl: "Must be a valid http(s) URL" });
  }
  Object.assign(record, payload);
  return delay(toDetail(record));
}

export async function mockDeleteBlog(id: string): Promise<void> {
  const record = mockBlogsDb.find((b) => b.id === id);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Blog not found", 404);
  }
  const caller = getMockCaller();
  const isAuthor = caller?.id === record.authorId;
  const isHead = !!caller && mockClubMembershipsDb.some((m) => m.clubId === record.clubId && m.userId === caller.id && m.role === "CLUB_HEAD");
  if (!caller || (!isAuthor && !isHead)) {
    await delay(null, 200);
    throw new ApiError("Caller is neither the author nor this club's Club Head", 403);
  }
  const idx = mockBlogsDb.indexOf(record);
  mockBlogsDb.splice(idx, 1);
  await delay(undefined);
}
