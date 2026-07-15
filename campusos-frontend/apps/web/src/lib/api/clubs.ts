import { del, get, patch, post, USE_MOCK } from "../api";
import * as mock from "../mock/clubs";
import type { Club, ClubDetail, ClubMember, ListQuery, PaginatedData } from "../../types";

export type { ListClubsParams, UpdateClubPayload } from "../mock/clubs";

export const clubsApi = {
  list: (params: mock.ListClubsParams = {}): Promise<PaginatedData<Club>> =>
    USE_MOCK ? mock.mockListClubs(params) : get("/clubs", params),

  get: (id: string): Promise<ClubDetail> => (USE_MOCK ? mock.mockGetClub(id) : get(`/clubs/${id}`)),

  update: (id: string, payload: mock.UpdateClubPayload): Promise<Club> =>
    USE_MOCK ? mock.mockUpdateClub(id, payload) : patch(`/clubs/${id}`, payload),

  listMembers: (clubId: string, params: ListQuery = {}): Promise<PaginatedData<ClubMember>> =>
    USE_MOCK ? mock.mockListClubMembers(clubId, params) : get(`/clubs/${clubId}/members`, params),

  addMember: (clubId: string, userId: string) =>
    USE_MOCK ? mock.mockAddClubMember(clubId, userId) : post(`/clubs/${clubId}/members`, { userId }),

  removeMember: (clubId: string, userId: string): Promise<void> =>
    USE_MOCK ? mock.mockRemoveClubMember(clubId, userId) : del(`/clubs/${clubId}/members/${userId}`),

  demoteMember: (clubId: string, userId: string) =>
    USE_MOCK
      ? mock.mockUpdateMemberRole(clubId, userId, "MEMBER")
      : patch(`/clubs/${clubId}/members/${userId}/role`, { role: "MEMBER" }),

  reassignFacultyCoordinator: (clubId: string, facultyCoordinatorId: string): Promise<Club> =>
    USE_MOCK
      ? mock.mockReassignFacultyCoordinator(clubId, facultyCoordinatorId)
      : patch(`/clubs/${clubId}/faculty-coordinator`, { facultyCoordinatorId }),

  transferHead: (clubId: string, newClubHeadUserId: string): Promise<{ clubId: string; newClubHeadUserId: string }> =>
    USE_MOCK
      ? mock.mockTransferClubHead(clubId, newClubHeadUserId)
      : post(`/clubs/${clubId}/transfer-head`, { newClubHeadUserId }),
};
