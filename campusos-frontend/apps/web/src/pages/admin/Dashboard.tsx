import { Link } from "react-router-dom";
import { useClubs } from "../../hooks/useClubs";
import { useClubRequestsList } from "../../hooks/useClubRequests";
import { Skeleton } from "../../components/ui/Skeleton";

function StatTile({ label, value, isLoading }: { label: string; value: number | undefined; isLoading: boolean }) {
  return (
    <div className="surface p-4 bg-white border-2 border-ink border-l-4 border-l-brand shadow-brutal rounded-none flex flex-col justify-between min-h-[100px]">
      <p style={{ color: '#555555' }} className="font-sans font-semibold uppercase text-[11px]">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-10 w-16" />
      ) : (
        <p className="mt-1 text-4xl font-extrabold font-display text-ink">{value ?? 0}</p>
      )}
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
    <div className="space-y-6 animate-brute-in">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 style={{ color: '#0A0A0A' }} className="mt-1 text-2xl font-extrabold font-display">Dashboard</h1>
        <p style={{ color: '#555555' }} className="text-sm">Platform overview and quick actions.</p>
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
        <Link to="/admin/club-requests" className="surface-interactive p-4 bg-white border-2 border-ink shadow-brutal hover:shadow-brutal-lg transition-all duration-100 rounded-none">
          <h2 className="text-base font-bold font-display text-ink">Club Requests</h2>
          <p style={{ color: '#555555' }} className="mt-1 text-xs">Review and approve pending club creation requests.</p>
        </Link>
        <Link to="/admin/users" className="surface-interactive p-4 bg-white border-2 border-ink shadow-brutal hover:shadow-brutal-lg transition-all duration-100 rounded-none">
          <h2 className="text-base font-bold font-display text-ink">User Management</h2>
          <p style={{ color: '#555555' }} className="mt-1 text-xs">Search users and change platform roles.</p>
        </Link>
        <Link to="/admin/analytics" className="surface-interactive p-4 bg-white border-2 border-ink shadow-brutal hover:shadow-brutal-lg transition-all duration-100 rounded-none">
          <h2 className="text-base font-bold font-display text-ink">Analytics</h2>
          <p style={{ color: '#555555' }} className="mt-1 text-xs">Lightweight platform counts.</p>
        </Link>
      </div>
    </div>
  );
}
