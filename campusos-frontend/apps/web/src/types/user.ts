import type { PlatformRole, ClubRole } from "./enums";

// GET /users — non-admin caller subset.
export interface UserMinimal {
  id: string;
  name: string;
  email: string;
}

// GET /users (Super Admin caller) and GET /users/:id.
export interface UserAdminView extends UserMinimal {
  platformRole: PlatformRole;
  createdAt: string;
}

// Base shape returned by POST /auth/register and POST /auth/login.
// Finalized decision 6.1: no clubMemberships field here at all, not even [].
export interface AuthUserBase {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
}

// Finalized decision 6.2: department is { id, name } only — head was dropped.
// Department Head can no longer be derived from this object; see lib/permissions.ts.
export interface ClubMembershipDepartmentRef {
  id: string;
  name: string;
}

export interface ClubMembership {
  clubId: string;
  clubName: string;
  role: ClubRole;
  department: ClubMembershipDepartmentRef | null;
}

// Returned only by GET /auth/me.
export interface CurrentUser extends AuthUserBase {
  clubMemberships: ClubMembership[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
