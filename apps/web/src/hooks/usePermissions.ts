import { useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import * as permissions from "../lib/permissions";

// Route-param-aware convenience wrapper around lib/permissions.ts for use inside pages
// (e.g. "is the current user the Club Head of :id"). ProtectedRoute uses the plain functions
// directly since it needs to evaluate a predicate before this component tree even renders.
export function usePermissions() {
  const { user } = useAuthContext();
  const params = useParams();

  return {
    user,
    isAuthenticated: permissions.isAuthenticated(user),
    isSuperAdmin: permissions.isSuperAdmin(user),
    isFacultyCoordinator: permissions.isFacultyCoordinator(user),
    isClubHeadOf: (clubId: string | undefined) => permissions.isClubHeadOf(user, clubId),
    isClubMemberOf: (clubId: string | undefined) => permissions.isClubMemberOf(user, clubId),
    currentClubId: params.id,
  };
}
