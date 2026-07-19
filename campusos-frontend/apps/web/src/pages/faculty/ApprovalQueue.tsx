import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useClubs } from "../../hooks/useClubs";
import { useApproveEvent, useEvents, useRejectEvent } from "../../hooks/useEvents";
import { RequestStatusBadge } from "../../components/ui/RequestStatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { FormTextarea } from "../../components/ui/FormField";
import { ApiError } from "../../lib/apiError";
import type { EventSummary } from "../../types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function PendingEventRow({ event }: { event: EventSummary }) {
  const approveEvent = useApproveEvent();
  const rejectEvent = useRejectEvent();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setError(null);
    try {
      await approveEvent.mutateAsync(event.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not approve");
    }
  }

  async function handleReject() {
    setError(null);
    try {
      await rejectEvent.mutateAsync({ id: event.id, reason: reason.trim() || undefined });
      setRejecting(false);
      setReason("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reject");
    }
  }

  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{event.title}</h3>
          <p className="mt-1 font-mono text-xs text-muted">
            {formatDateTime(event.startTime)}–{formatDateTime(event.endTime)} · {event.location}
          </p>
        </div>
        <RequestStatusBadge status={event.status} />
      </div>
      <p className="mt-2 text-sm text-muted">{event.description}</p>

      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

      {!rejecting ? (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={handleApprove} disabled={approveEvent.isPending} className="btn-primary !px-3 !py-1.5 text-xs">
            {approveEvent.isPending ? "Approving…" : "Approve"}
          </button>
          <button type="button" onClick={() => setRejecting(true)} className="btn-danger !px-3 !py-1.5 text-xs">
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <FormTextarea
            label="Rejection reason (optional)"
            name={`reason-${event.id}`}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={rejectEvent.isPending}
              className="btn bg-rose-600 !px-3 !py-1.5 text-xs text-white hover:bg-rose-500"
            >
              {rejectEvent.isPending ? "Rejecting…" : "Confirm reject"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
              className="btn-secondary !px-3 !py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApprovalQueue() {
  const { user } = useAuthContext();
  // No endpoint returns "the club I coordinate" directly — GET /clubs is public and already
  // exposes facultyCoordinatorId per club, so that's resolved client-side from the existing
  // club list rather than inventing a new endpoint.
  const clubsQuery = useClubs({ limit: 100 });
  const coordinatedClub = clubsQuery.data?.items.find((c) => c.facultyCoordinatorId === user?.id);

  const eventsQuery = useEvents({ status: "PENDING", clubId: coordinatedClub?.id, limit: 50 });

  if (clubsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!coordinatedClub) {
    return <EmptyState title="No club assigned" description="You aren't currently the Faculty Coordinator of any club." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="eyebrow">Faculty</span>
        <h1 className="mt-1 text-xl font-semibold">Approval Queue</h1>
        <p className="text-sm text-muted">Pending event requests for {coordinatedClub.name}.</p>
      </div>

      {eventsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {eventsQuery.isError && !eventsQuery.isLoading && <p className="text-sm text-rose-400">Couldn't load pending events.</p>}

      {!eventsQuery.isLoading && !eventsQuery.isError && eventsQuery.data && eventsQuery.data.items.length === 0 && (
        <EmptyState title="No pending events" />
      )}

      {!eventsQuery.isLoading && !eventsQuery.isError && eventsQuery.data && eventsQuery.data.items.length > 0 && (
        <div className="space-y-3">
          {eventsQuery.data.items.map((event) => (
            <PendingEventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
