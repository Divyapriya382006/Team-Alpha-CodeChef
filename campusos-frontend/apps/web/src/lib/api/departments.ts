import { del, get, patch, post, USE_MOCK } from "../api";
import * as mock from "../mock/departments";
import type { Department, DepartmentDetail, DepartmentSummary } from "../../types";

export const departmentsApi = {
  listForClub: (clubId: string): Promise<DepartmentSummary[]> =>
    USE_MOCK ? mock.mockListDepartments(clubId) : get(`/clubs/${clubId}/departments`),

  create: (clubId: string, name: string) =>
    USE_MOCK ? mock.mockCreateDepartment(clubId, name) : post(`/clubs/${clubId}/departments`, { name }),

  get: (id: string): Promise<DepartmentDetail> => (USE_MOCK ? mock.mockGetDepartment(id) : get(`/departments/${id}`)),

  setHead: (id: string, userId: string | null): Promise<Department> =>
    USE_MOCK ? mock.mockSetDepartmentHead(id, userId) : patch(`/departments/${id}/head`, { userId }),

  addMember: (departmentId: string, userId: string) =>
    USE_MOCK ? mock.mockAddDepartmentMember(departmentId, userId) : post(`/departments/${departmentId}/members`, { userId }),

  removeMember: (departmentId: string, userId: string): Promise<void> =>
    USE_MOCK ? mock.mockRemoveDepartmentMember(departmentId, userId) : del(`/departments/${departmentId}/members/${userId}`),
};
