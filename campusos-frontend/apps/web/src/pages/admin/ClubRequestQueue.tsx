import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApproveClubRequest, useClubRequestsList, useRejectClubRequest } from "../../hooks/useClubRequests";
import { useUserSearch } from "../../hooks/useUsers";
import { FormSelect, FormTextarea } from "../../components/ui/FormField";
import { SearchBar } from "../../components/ui/SearchBar";
import { RequestStatusBadge } from "../../components/ui/RequestStatusBadge";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";
import type { ClubRequest, RequestStatus } from "../../types";

const PAGE_SIZE = 20;

function ApproveForm({ request, onDone }: { request: ClubRequest; onDone: () => void }) {
  const approve = useApproveClubRequest();
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useUserSearch({ search: searchTerm, limit: 5 });
  const [error, setError] = useState<string | null>(null);

  async function handleAssign(userId: string) {
    setError(null);
    try {
      await approve.mutateAsync({ id: request.id, facultyCoordinatorId: userId });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not approve");
    }
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-sm font-medium text-slate-300">Assign a Faculty Coordinator to approve</p>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <SearchBar placeholder="Search users…" onSearch={setSearchTerm} />
      {searchTerm && (
        <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950/60">
          {searchResults.isLoading && <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>}
          {searchResults.data?.items.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-200">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleAssign(u.id)}
                disabled={approve.isPending}
                className="btn-primary !px-3 !py-1 text-xs"
              >
                Assign & approve
              </button>
            </div>
          ))}
          {searchResults.data && searchResults.data.items.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500">No matching users.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ClubRequestRow({ request }: { request: ClubRequest }) {
  const rejectRequest = useRejectClubRequest();
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleReject() {
    setError(null);
    try {
      await rejectRequest.mutateAsync({ id: request.id, reason: reason.trim() || undefined });
      setMode("idle");
      setReason("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reject");
    }
  }

  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{request.clubName}</h3>
        <RequestStatusBadge status={request.status} />
      </div>
      <p className="mt-2 text-sm text-muted">{request.description}</p>
      <dl className="mt-3 space-y-1 text-xs text-muted">
        <div>
          <dt className="inline font-medium text-ink">Faculty details: </dt>
          <dd className="inline">{request.facultyDetails}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink">Reason: </dt>
          <dd className="inline">{request.reason}</dd>
        </div>
      </dl>

      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

      {request.status === "PENDING" && mode === "idle" && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => setMode("approve")} className="btn-primary !px-3 !py-1.5 text-xs">
            Approve
          </button>
          <button type="button" onClick={() => setMode("reject")} className="btn-danger !px-3 !py-1.5 text-xs">
            Reject
          </button>
        </div>
      )}

      {mode === "approve" && <ApproveForm request={request} onDone={() => setMode("idle")} />}

      {mode === "reject" && (
        <div className="mt-3 space-y-2">
          <FormTextarea
            label="Rejection reason (optional)"
            name={`reason-${request.id}`}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={rejectRequest.isPending}
              className="btn bg-rose-600 !px-3 !py-1.5 text-xs text-white hover:bg-rose-500"
            >
              {rejectRequest.isPending ? "Rejecting…" : "Confirm reject"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
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

export function ClubRequestQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") as RequestStatus | null;
  const page = Number(searchParams.get("page") ?? "1");

  const requestsQuery = useClubRequestsList({ status: status ?? undefined, page, limit: PAGE_SIZE });

  function updateParams(next: { status?: string; page?: number }) {
    const params = new URLSearchParams(searchParams);
    if (next.status !== undefined) {
      if (next.status) params.set("status", next.status);
      else params.delete("status");
      params.set("page", "1");
    }
    if (next.page !== undefined) params.set("page", String(next.page));
    setSearchParams(params);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 className="mt-1 text-xl font-semibold">Club Requests</h1>
          <p className="text-sm text-muted">Approve or reject pending club creation requests.</p>
        </div>
        <div className="sm:w-56">
          <FormSelect
            label="Status"
            name="status"
            value={status ?? ""}
            onChange={(e) => updateParams({ status: e.target.value })}
            options={[
              { value: "", label: "All statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
        </div>
      </div>

      {requestsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!requestsQuery.isLoading && requestsQuery.data && requestsQuery.data.items.length === 0 && <EmptyState title="No requests" />}

      {!requestsQuery.isLoading && requestsQuery.data && requestsQuery.data.items.length > 0 && (
        <>
          <div className="space-y-3">
            {requestsQuery.data.items.map((r) => (
              <ClubRequestRow key={r.id} request={r} />
            ))}
          </div>
          <Pagination pagination={requestsQuery.data.pagination} onPageChange={(p) => updateParams({ page: p })} />
        </>
      )}
    </div>
  );
}
