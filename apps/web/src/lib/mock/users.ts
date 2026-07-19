import { ApiError } from "../apiError";
import { delay, getMockCaller, isClubHeadAnywhere, mockUsersDb, paginate } from "./db";
import type { ListQuery, PaginatedData, PlatformRole, UserAdminView, UserMinimal } from "../../types";

export interface SearchUsersParams extends ListQuery {
  search?: string;
}

export async function mockSearchUsers(params: SearchUsersParams = {}): Promise<PaginatedData<UserMinimal | UserAdminView>> {
  const caller = getMockCaller();
  const allowed =
    !!caller &&
    (caller.platformRole === "SUPER_ADMIN" || caller.platformRole === "FACULTY_COORDINATOR" || isClubHeadAnywhere(caller.id));
  if (!allowed) {
    await delay(null, 200);
    throw new ApiError("Caller is not a Club Head, Faculty Coordinator, or Super Admin", 403);
  }

  const { search, page = 1, limit = 20 } = params;
  let results = mockUsersDb;
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  const items: (UserMinimal | UserAdminView)[] = results.map((u) =>
    caller!.platformRole === "SUPER_ADMIN"
      ? { id: u.id, name: u.name, email: u.email, platformRole: u.platformRole, createdAt: u.createdAt }
      : { id: u.id, name: u.name, email: u.email },
  );

  return delay(paginate(items, page, limit));
}

export async function mockChangeUserRole(userId: string, platformRole: PlatformRole): Promise<UserAdminView> {
  const caller = getMockCaller();
  if (!caller || caller.platformRole !== "SUPER_ADMIN") {
    await delay(null, 200);
    throw new ApiError("Caller is not a Super Admin", 403);
  }
  const record = mockUsersDb.find((u) => u.id === userId);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("User not found", 404);
  }
  if (record.platformRole === "SUPER_ADMIN" && platformRole !== "SUPER_ADMIN") {
    const remainingSuperAdmins = mockUsersDb.filter((u) => u.platformRole === "SUPER_ADMIN" && u.id !== userId);
    if (remainingSuperAdmins.length === 0) {
      await delay(null, 200);
      throw new ApiError("Change would leave zero SUPER_ADMIN users on the platform", 400);
    }
  }
  record.platformRole = platformRole;
  return delay({ id: record.id, name: record.name, email: record.email, platformRole: record.platformRole, createdAt: record.createdAt });
}
