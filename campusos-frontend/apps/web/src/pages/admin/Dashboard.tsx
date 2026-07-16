import { Link } from "react-router-dom";
import { useClubs } from "../../hooks/useClubs";
import { useClubRequestsList } from "../../hooks/useClubRequests";
import { Skeleton } from "../../components/ui/Skeleton";

function StatTile({ label, value, isLoading }: { label: string; value: number | undefined; isLoading: boolean }) {
  return (
    <div className="surface p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-slate-500">{label}</p>
      {isLoading ? <Skeleton className="mt-2 h-7 w-12" /> : <p className="mt-1 text-2xl font-semibold text-white">{value ?? 0}</p>}
    </div>
  );
}

// Not a page defined in FINAL_TEAM_BUILD_GUIDE.md — /admin/club-requests and /admin/users are
// the only two documented Super Admin routes. Built here as a landing page for both, since the
// module needs an entry point beyond a bare URL.
export function Dashboard() {
  const clubsQuery = useClubs({ limit: 1 });
  const pendingRequestsQuery = useClubRequestsList({ status: "PENDING", limit: 1 });

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 className="mt-1 text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500">Platform overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="Total clubs" value={clubsQuery.data?.pagination.total} isLoading={clubsQuery.isLoading} />
        <StatTile
          label="Pending club requests"
          value={pendingRequestsQuery.data?.pagination.total}
          isLoading={pendingRequestsQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/admin/club-requests" className="surface-interactive p-4">
          <h2 className="text-sm font-semibold text-white">Club Requests</h2>
          <p className="mt-1 text-sm text-slate-500">Review and approve pending club creation requests.</p>
        </Link>
        <Link to="/admin/users" className="surface-interactive p-4">
          <h2 className="text-sm font-semibold text-white">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">Search users and change platform roles.</p>
        </Link>
        <Link to="/admin/analytics" className="surface-interactive p-4">
          <h2 className="text-sm font-semibold text-white">Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Lightweight platform counts.</p>
        </Link>
      </div>
    </div>
  );
}
