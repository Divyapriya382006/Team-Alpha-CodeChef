import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useEvent, useRegisterEvent, useUnregisterEvent } from "../../hooks/useEvents";
import { RequestStatusBadge } from "../../components/ui/RequestStatusBadge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isClubMemberOf } = usePermissions();
  const eventQuery = useEvent(id);
  const registerMutation = useRegisterEvent();
  const unregisterMutation = useUnregisterEvent();

  // FINAL_API_CONTRACT.md never exposes whether the current caller is already registered for an
  // event — EventDetail only carries registeredCount, and GET /events/:id/registrations (the
  // endpoint that lists individual registrants) is restricted to that club's Club Head/Faculty
  // Coordinator, not the registrant themself. So this is inferred optimistically from mutation
  // outcomes: a successful POST, or a 409 from POST ("already registered"), both flip this true;
  // a successful DELETE, or a 404 from DELETE ("not registered"), flip it false. A fresh page
  // load defaults to false even if the caller is genuinely already registered — that's a real
  // limitation of the documented contract, not something fixable from the frontend alone.
  const [registered, setRegistered] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [confirmUnregister, setConfirmUnregister] = useState(false);

  if (eventQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (eventQuery.isError) {
    const status = eventQuery.error instanceof ApiError ? eventQuery.error.status : 500;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-white">{status === 404 ? "Event not found" : "Something went wrong"}</h1>
        <Link to="/events" className="mt-3 inline-block text-sm text-brand-400 hover:text-brand-300">
          Back to events
        </Link>
      </div>
    );
  }

  const event = eventQuery.data!;
  const isFull = event.capacity !== null && event.registeredCount >= event.capacity;
  const isExclusiveNonMember = event.type === "CLUB_EXCLUSIVE" && !!user && !isClubMemberOf(event.clubId);

  async function handleRegister() {
    setRegisterError(null);
    try {
      await registerMutation.mutateAsync(event.id);
      setRegistered(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setRegistered(true);
      } else {
        setRegisterError(err instanceof ApiError ? err.message : "Could not register");
      }
    }
  }

  async function handleUnregister() {
    setRegisterError(null);
    try {
      await unregisterMutation.mutateAsync(event.id);
      setRegistered(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setRegistered(false);
      } else {
        setRegisterError(err instanceof ApiError ? err.message : "Could not unregister");
      }
    }
    setConfirmUnregister(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <div className="surface p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-white">{event.title}</h1>
          <RequestStatusBadge status={event.status} />
        </div>
        <p className="mt-3 text-sm text-slate-400">{event.description}</p>

        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-800 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-slate-500">Location</dt>
            <dd className="mt-0.5 text-slate-300">{event.location}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-slate-500">Type</dt>
            <dd className="mt-0.5 text-slate-300">{event.type === "PUBLIC" ? "Public" : "Club Exclusive"}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-slate-500">Starts</dt>
            <dd className="mt-0.5 text-slate-300">{formatDateTime(event.startTime)}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-slate-500">Ends</dt>
            <dd className="mt-0.5 text-slate-300">{formatDateTime(event.endTime)}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-slate-500">Registered</dt>
            <dd className="mt-0.5 text-slate-300">
              {event.registeredCount}
              {event.capacity !== null ? ` / ${event.capacity}` : " (unlimited capacity)"}
            </dd>
          </div>
        </dl>

        {event.status === "REJECTED" && event.rejectionReason && (
          <p className="mt-4 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
            Rejected: {event.rejectionReason}
          </p>
        )}

        {registerError && (
          <p className="mt-4 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{registerError}</p>
        )}

        {event.status === "APPROVED" && (
          <div className="mt-5">
            {!user ? (
              <button
                type="button"
                onClick={() => navigate("/login", { state: { from: { pathname: `/events/${event.id}` } } })}
                className="btn-primary"
              >
                Login to Register
              </button>
            ) : registered ? (
              <button
                type="button"
                onClick={() => setConfirmUnregister(true)}
                className="btn border border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70"
              >
                Registered ✓ — Cancel
              </button>
            ) : isExclusiveNonMember ? (
              <button type="button" disabled className="btn bg-slate-800 text-slate-500">
                Members only
              </button>
            ) : isFull ? (
              <button type="button" disabled className="btn bg-slate-800 text-slate-500">
                Full
              </button>
            ) : (
              <button type="button" onClick={handleRegister} disabled={registerMutation.isPending} className="btn-primary">
                {registerMutation.isPending ? "Registering…" : "Register"}
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmUnregister}
        title="Cancel your registration?"
        message="You can register again later if there's still room."
        confirmLabel="Cancel registration"
        isDestructive
        isLoading={unregisterMutation.isPending}
        onConfirm={handleUnregister}
        onCancel={() => setConfirmUnregister(false)}
      />
    </div>
  );
}
