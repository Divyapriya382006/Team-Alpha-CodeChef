import { del, get, patch, post, USE_MOCK } from "../api";
import * as mock from "../mock/blogs";
import type { BlogDetail, BlogSummary, PaginatedData } from "../../types";

export type { CreateBlogPayload, EditBlogPayload, ListBlogsParams } from "../mock/blogs";

export const blogsApi = {
  list: (params: mock.ListBlogsParams = {}): Promise<PaginatedData<BlogSummary>> =>
    USE_MOCK ? mock.mockListBlogs(params) : get("/blogs", params),

  get: (id: string): Promise<BlogDetail> => (USE_MOCK ? mock.mockGetBlog(id) : get(`/blogs/${id}`)),

  create: (clubId: string, payload: mock.CreateBlogPayload): Promise<{ id: string }> =>
    USE_MOCK ? mock.mockCreateBlog(clubId, payload) : post(`/clubs/${clubId}/blogs`, payload),

  edit: (id: string, payload: mock.EditBlogPayload): Promise<BlogDetail> =>
    USE_MOCK ? mock.mockEditBlog(id, payload) : patch(`/blogs/${id}`, payload),

  remove: (id: string): Promise<void> => (USE_MOCK ? mock.mockDeleteBlog(id) : del(`/blogs/${id}`)),
};
