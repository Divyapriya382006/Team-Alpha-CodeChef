import { get, patch, USE_MOCK } from "../api";
import * as mock from "../mock/users";
import type { PaginatedData, PlatformRole, UserAdminView, UserMinimal } from "../../types";

export type { SearchUsersParams } from "../mock/users";

export const usersApi = {
  search: (params: mock.SearchUsersParams = {}): Promise<PaginatedData<UserMinimal | UserAdminView>> =>
    USE_MOCK ? mock.mockSearchUsers(params) : get("/users", params),

  changeRole: (userId: string, platformRole: PlatformRole): Promise<UserAdminView> =>
    USE_MOCK ? mock.mockChangeUserRole(userId, platformRole) : patch(`/users/${userId}/role`, { platformRole }),
};
