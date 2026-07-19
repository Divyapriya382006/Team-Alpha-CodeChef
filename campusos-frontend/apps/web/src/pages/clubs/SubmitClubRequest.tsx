import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useClubRequest, useSubmitClubRequest, useWithdrawClubRequest } from "../../hooks/useClubRequests";
import { FormField, FormTextarea } from "../../components/ui/FormField";
import { RequestStatusBadge } from "../../components/ui/RequestStatusBadge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";

const EMPTY_FORM = { clubName: "", description: "", facultyDetails: "", reason: "" };

export function SubmitClubRequest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get("requestId") ?? undefined;

  const requestQuery = useClubRequest(requestId);
  const submitMutation = useSubmitClubRequest();
  const withdrawMutation = useWithdrawClubRequest();

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    try {
      const result = await submitMutation.mutateAsync(form);
      setSearchParams({ requestId: result.id });
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      else if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Something went wrong");
    }
  }

  async function handleWithdraw() {
    if (!requestId) return;
    await withdrawMutation.mutateAsync(requestId);
    setConfirmWithdraw(false);
    setSearchParams({});
    setForm(EMPTY_FORM);
  }

  if (requestId) {
    if (requestQuery.isLoading) {
      return (
        <div className="mx-auto max-w-xl space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (requestQuery.isError || !requestQuery.data) {
      return <p className="text-sm text-rose-400">Couldn't load your request.</p>;
    }

    const request = requestQuery.data;

    return (
      <div className="mx-auto max-w-xl">
        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{request.clubName}</h1>
            <RequestStatusBadge status={request.status} />
          </div>
          <p className="mt-3 text-sm text-muted">{request.description}</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-muted">Faculty details</dt>
              <dd className="text-ink">{request.facultyDetails}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted">Reason</dt>
              <dd className="text-ink">{request.reason}</dd>
            </div>
            {request.status === "REJECTED" && request.rejectionReason && (
              <div>
                <dt className="font-medium text-muted">Rejection reason</dt>
                <dd className="text-rose-400">{request.rejectionReason}</dd>
              </div>
            )}
          </dl>

          {request.status === "PENDING" && (
            <button type="button" onClick={() => setConfirmWithdraw(true)} className="btn-danger mt-5">
              Withdraw request
            </button>
          )}
          {request.status === "APPROVED" && <p className="mt-5 text-sm text-emerald-400">Approved — your club is now live.</p>}
        </div>

        <ConfirmDialog
          open={confirmWithdraw}
          title="Withdraw request?"
          message="This can't be undone. You'll need to submit a new request if you change your mind."
          confirmLabel="Withdraw"
          isDestructive
          isLoading={withdrawMutation.isPending}
          onConfirm={handleWithdraw}
          onCancel={() => setConfirmWithdraw(false)}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto max-w-xl space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">Request a new club</h1>
        <p className="mt-1 text-sm text-muted">A Super Admin will review this and assign a Faculty Coordinator if approved.</p>
      </div>

      {formError && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{formError}</p>}

      <FormField
        label="Club name"
        name="clubName"
        required
        maxLength={100}
        value={form.clubName}
        onChange={(e) => updateField("clubName", e.target.value)}
        error={fieldErrors.clubName}
      />
      <FormTextarea
        label="Description"
        name="description"
        required
        rows={3}
        value={form.description}
        onChange={(e) => updateField("description", e.target.value)}
        error={fieldErrors.description}
      />
      <FormTextarea
        label="Faculty details"
        name="facultyDetails"
        required
        rows={2}
        value={form.facultyDetails}
        onChange={(e) => updateField("facultyDetails", e.target.value)}
        error={fieldErrors.facultyDetails}
        hint="Name/department of a faculty member who has agreed to support this club."
      />
      <FormTextarea
        label="Reason"
        name="reason"
        required
        rows={3}
        value={form.reason}
        onChange={(e) => updateField("reason", e.target.value)}
        error={fieldErrors.reason}
        hint="Why does campus need this club?"
      />

      <button type="submit" disabled={submitMutation.isPending} className="btn-primary w-full">
        {submitMutation.isPending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
