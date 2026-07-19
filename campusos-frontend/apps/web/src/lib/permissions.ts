import type { CurrentUser } from "../types";

// Pure predicates over CurrentUser, shared by UI-gating (Navbar, buttons) and route-gating
// (ProtectedRoute). Never used as the actual authorization boundary — the backend re-checks
// every one of these independently. See FINAL_TEAM_BUILD_GUIDE.md "Permission-based UI rendering".

export function isAuthenticated(user: CurrentUser | null): user is CurrentUser {
  return user !== null;
}

export function isSuperAdmin(user: CurrentUser | null): boolean {
  return user?.platformRole === "SUPER_ADMIN";
}

export function isFacultyCoordinator(user: CurrentUser | null): boolean {
  return user?.platformRole === "FACULTY_COORDINATOR";
}

export function isClubHeadOf(user: CurrentUser | null, clubId: string | undefined): boolean {
  if (!user || !clubId) return false;
  return user.clubMemberships.some((m) => m.clubId === clubId && m.role === "CLUB_HEAD");
}

export function isClubMemberOf(user: CurrentUser | null, clubId: string | undefined): boolean {
  if (!user || !clubId) return false;
  return user.clubMemberships.some((m) => m.clubId === clubId);
}

export function isClubHeadOrSuperAdmin(user: CurrentUser | null, clubId: string | undefined): boolean {
  return isSuperAdmin(user) || isClubHeadOf(user, clubId);
}

// Department Head is NOT resolvable from CurrentUser. Finalized decision 6.2 dropped `head`
// from ClubMembership.department, so the only source of truth is Department.headUserId via
// GET /departments/:id. Any page gating on "or Department Head" must fetch that endpoint itself
// and compare `department.headUserId === user.id` — there is no client-side shortcut.
