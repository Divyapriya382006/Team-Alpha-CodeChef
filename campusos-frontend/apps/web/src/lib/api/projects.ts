import { del, get, patch, post, USE_MOCK } from "../api";
import * as mock from "../mock/projects";
import type { PaginatedData, ProjectDetail, ProjectSummary } from "../../types";

export type { CreateProjectPayload, EditProjectPayload, ListProjectsParams } from "../mock/projects";

export const projectsApi = {
  list: (params: mock.ListProjectsParams = {}): Promise<PaginatedData<ProjectSummary>> =>
    USE_MOCK ? mock.mockListProjects(params) : get("/projects", params),

  get: (id: string): Promise<ProjectDetail> => (USE_MOCK ? mock.mockGetProject(id) : get(`/projects/${id}`)),

  create: (clubId: string, payload: mock.CreateProjectPayload): Promise<{ id: string }> =>
    USE_MOCK ? mock.mockCreateProject(clubId, payload) : post(`/clubs/${clubId}/projects`, payload),

  edit: (id: string, payload: mock.EditProjectPayload): Promise<ProjectDetail> =>
    USE_MOCK ? mock.mockEditProject(id, payload) : patch(`/projects/${id}`, payload),

  remove: (id: string): Promise<void> => (USE_MOCK ? mock.mockDeleteProject(id) : del(`/projects/${id}`)),
};
