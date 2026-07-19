import { ApiError } from "./apiError";
import { getToken } from "./tokenStorage";
import { delay, getClubMembershipsForUser, mockUsersDb, nextId } from "./mock/db";
import type { AuthUserBase, CurrentUser, LoginPayload, RegisterPayload } from "../types";

// Auth-specific mock endpoints. Every other mock module lives under lib/mock/ and reads the same
// shared lib/mock/db.ts records — kept here (rather than moved into lib/mock/) so lib/api.ts's
// import path doesn't change.

function toAuthUserBase(record: (typeof mockUsersDb)[number]): AuthUserBase {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    platformRole: record.platformRole,
  };
}

// Encodes the user id directly into the token so mockGetCurrentUser survives a page refresh
// without needing a server-side session store. Not a real JWT — mock only.
function issueToken(userId: string): string {
  return `mock.${userId}.${Date.now()}`;
}

export async function mockLogin(payload: LoginPayload): Promise<{ user: AuthUserBase; token: string }> {
  const record = mockUsersDb.find((u) => u.email === payload.email);
  if (!record || record.password !== payload.password) {
    await delay(null, 300);
    // Generic message regardless of which field was wrong, per FINAL_API_CONTRACT.md.
    throw new ApiError("Invalid email or password", 401);
  }
  return delay({ user: toAuthUserBase(record), token: issueToken(record.id) });
}

export async function mockRegister(payload: RegisterPayload): Promise<{ user: AuthUserBase; token: string }> {
  if (mockUsersDb.some((u) => u.email === payload.email)) {
    await delay(null, 300);
    throw new ApiError("Email already registered", 409, { email: "Email already registered" });
  }
  const record = {
    id: nextId("user"),
    name: payload.name,
    email: payload.email,
    password: payload.password,
    platformRole: "STUDENT" as const,
    createdAt: new Date().toISOString(),
  };
  mockUsersDb.push(record);
  return delay({ user: toAuthUserBase(record), token: issueToken(record.id) });
}

export async function mockGetCurrentUser(): Promise<CurrentUser> {
  const token = getToken();
  const userId = token?.startsWith("mock.") ? token.split(".")[1] : undefined;
  const record = mockUsersDb.find((u) => u.id === userId);
  if (!record) {
    await delay(null, 200);
    throw new ApiError("Missing/invalid/expired token", 401);
  }
  return delay({
    id: record.id,
    name: record.name,
    email: record.email,
    platformRole: record.platformRole,
    clubMemberships: getClubMembershipsForUser(record.id),
  });
}
