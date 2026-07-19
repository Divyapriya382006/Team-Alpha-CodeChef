import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import type { CurrentUser } from "../../types";

interface ProtectedRouteProps {
  // Only receives what's resolvable from CurrentUser + route params (platform role, or club-level
  // role via clubMemberships). Checks that need a fetched resource — e.g. Department Head, which
  // isn't in CurrentUser at all since finalized decision 6.2 — must be done inside the page itself.
  predicate?: (user: CurrentUser, params: Readonly<Record<string, string | undefined>>) => boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ predicate, redirectTo = "/" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();
  const params = useParams();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">Loading…</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (predicate && !predicate(user, params)) {
    return <Navigate to={redirectTo} state={{ unauthorized: true }} replace />;
  }

  return <Outlet />;
}
