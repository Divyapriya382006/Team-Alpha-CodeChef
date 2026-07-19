import { useClubs } from "../../hooks/useClubs";
import { useUsers } from "../../hooks/useUsers";
import { useClubRequestsList } from "../../hooks/useClubRequests";
import { useEvents } from "../../hooks/useEvents";
import { Skeleton } from "../../components/ui/Skeleton";

function StatTile({ label, value, isLoading }: { label: string; value: number | undefined; isLoading: boolean }) {
  return (
    <div className="surface p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{label}</p>
      {isLoading ? <Skeleton className="mt-2 h-7 w-12" /> : <p className="mt-1 text-2xl font-semibold">{value ?? 0}</p>}
    </div>
  );
}

// FINAL_TEAM_BUILD_GUIDE.md lists a "Platform analytics dashboard" under Out of Scope — Do Not
// Build, and FINAL_API_CONTRACT.md has no dedicated analytics endpoint. Every number on this page
// is a `pagination.total` read off an endpoint that already exists elsewhere in this app (GET
// /clubs, GET /users, GET /club-requests, GET /events) — nothing here is invented, estimated, or
// backed by a new endpoint. Treat it as a bonus, not a documented requirement.
export function Analytics() {
  const clubsQuery = useClubs({ limit: 1 });
  const usersQuery = useUsers({ limit: 1 });
  const pendingRequests = useClubRequestsList({ status: "PENDING", limit: 1 });
  const approvedRequests = useClubRequestsList({ status: "APPROVED", limit: 1 });
  const rejectedRequests = useClubRequestsList({ status: "REJECTED", limit: 1 });
  const pendingEvents = useEvents({ status: "PENDING", limit: 1 });
  const approvedEvents = useEvents({ status: "APPROVED", limit: 1 });
  const rejectedEvents = useEvents({ status: "REJECTED", limit: 1 });

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 className="mt-1 text-xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-amber-400">
          Not part of the documented scope — shown here as simple counts from existing endpoints, not a real analytics system.
        </p>
      </div>

      <section>
        <h2 className="eyebrow">Platform</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatTile label="Total clubs" value={clubsQuery.data?.pagination.total} isLoading={clubsQuery.isLoading} />
          <StatTile label="Total users" value={usersQuery.data?.pagination.total} isLoading={usersQuery.isLoading} />
        </div>
      </section>

      <section>
        <h2 className="eyebrow">Club Requests</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Pending" value={pendingRequests.data?.pagination.total} isLoading={pendingRequests.isLoading} />
          <StatTile label="Approved" value={approvedRequests.data?.pagination.total} isLoading={approvedRequests.isLoading} />
          <StatTile label="Rejected" value={rejectedRequests.data?.pagination.total} isLoading={rejectedRequests.isLoading} />
        </div>
      </section>

      <section>
        <h2 className="eyebrow">Events</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Pending" value={pendingEvents.data?.pagination.total} isLoading={pendingEvents.isLoading} />
          <StatTile label="Approved" value={approvedEvents.data?.pagination.total} isLoading={approvedEvents.isLoading} />
          <StatTile label="Rejected" value={rejectedEvents.data?.pagination.total} isLoading={rejectedEvents.isLoading} />
        </div>
      </section>
    </div>
  );
}
