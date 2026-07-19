import { del, get, patch, post, USE_MOCK } from "../api";
import * as mock from "../mock/clubRequests";
import type { ClubRequest, ClubRequestDetail, PaginatedData } from "../../types";

export type { ListClubRequestsParams, SubmitClubRequestPayload } from "../mock/clubRequests";

export const clubRequestsApi = {
  submit: (payload: mock.SubmitClubRequestPayload): Promise<{ id: string; status: "PENDING" }> =>
    USE_MOCK ? mock.mockSubmitClubRequest(payload) : post("/club-requests", payload),

  list: (params: mock.ListClubRequestsParams = {}): Promise<PaginatedData<ClubRequest>> =>
    USE_MOCK ? mock.mockListClubRequests(params) : get("/club-requests", params),

  getOne: (id: string): Promise<ClubRequestDetail> =>
    USE_MOCK ? mock.mockGetClubRequest(id) : get(`/club-requests/${id}`),

  approve: (id: string, facultyCoordinatorId: string): Promise<{ clubId: string; requestId: string; status: "APPROVED" }> =>
    USE_MOCK
      ? mock.mockApproveClubRequest(id, facultyCoordinatorId)
      : patch(`/club-requests/${id}/approve`, { facultyCoordinatorId }),

  reject: (id: string, reason?: string): Promise<{ id: string; status: "REJECTED" }> =>
    USE_MOCK ? mock.mockRejectClubRequest(id, reason) : patch(`/club-requests/${id}/reject`, { reason }),

  withdraw: (id: string): Promise<void> =>
    USE_MOCK ? mock.mockWithdrawClubRequest(id) : del(`/club-requests/${id}`),
};
