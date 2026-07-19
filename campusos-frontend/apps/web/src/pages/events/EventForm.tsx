import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateEvent, useEditEvent, useEvent } from "../../hooks/useEvents";
import { FormField, FormSelect, FormTextarea } from "../../components/ui/FormField";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "../../lib/utils/datetime";
import type { EventType } from "../../types";

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "PUBLIC" as EventType,
  capacity: "",
  location: "",
  startTime: "",
  endTime: "",
};

export function EventForm() {
  const { id: clubId, eventId } = useParams<{ id: string; eventId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!eventId;

  const eventQuery = useEvent(eventId);
  const createEvent = useCreateEvent(clubId as string);
  const editEvent = useEditEvent(clubId as string, eventId as string);

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && eventQuery.data) {
      const e = eventQuery.data;
      setForm({
        title: e.title,
        description: e.description,
        type: e.type,
        capacity: e.capacity === null ? "" : String(e.capacity),
        location: e.location,
        startTime: toDatetimeLocalValue(e.startTime),
        endTime: toDatetimeLocalValue(e.endTime),
      });
    }
  }, [isEdit, eventQuery.data]);

  // APPROVED events can't be edited (FINAL_TEAM_BUILD_GUIDE.md) — bounce back to the event
  // rather than showing a form that will just 400 on submit.
  useEffect(() => {
    if (isEdit && eventQuery.data?.status === "APPROVED") {
      navigate(`/events/${eventId}`, { replace: true });
    }
  }, [isEdit, eventQuery.data?.status, eventId, navigate]);

  function updateField<K extends keyof typeof EMPTY_FORM>(field: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      capacity: form.capacity === "" ? null : Number(form.capacity),
      location: form.location,
      startTime: fromDatetimeLocalValue(form.startTime),
      endTime: fromDatetimeLocalValue(form.endTime),
    };

    try {
      if (isEdit) {
        await editEvent.mutateAsync(payload);
        navigate(`/events/${eventId}`);
      } else {
        const result = await createEvent.mutateAsync(payload);
        navigate(`/events/${result.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      else if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Something went wrong");
    }
  }

  if (isEdit && eventQuery.isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isEdit && eventQuery.data?.status === "APPROVED") {
    return null;
  }

  const isPending = isEdit ? editEvent.isPending : createEvent.isPending;

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-lg font-semibold">{isEdit ? "Edit event" : "Request a new event"}</h1>

      {formError && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{formError}</p>}
      {isEdit && (
        <p className="rounded-lg border border-amber-900/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-300">
          Saving will reset this event's status to Pending for re-review.
        </p>
      )}

      <FormField
        label="Title"
        name="title"
        required
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        error={fieldErrors.title}
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
      <FormSelect
        label="Type"
        name="type"
        value={form.type}
        onChange={(e) => updateField("type", e.target.value as EventType)}
        options={[
          { value: "PUBLIC", label: "Public" },
          { value: "CLUB_EXCLUSIVE", label: "Club Exclusive" },
        ]}
      />
      <FormField
        label="Location"
        name="location"
        required
        value={form.location}
        onChange={(e) => updateField("location", e.target.value)}
        error={fieldErrors.location}
      />
      <FormField
        label="Capacity"
        name="capacity"
        type="number"
        min={1}
        placeholder="Leave blank for unlimited"
        value={form.capacity}
        onChange={(e) => updateField("capacity", e.target.value)}
        error={fieldErrors.capacity}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Starts"
          name="startTime"
          type="datetime-local"
          required
          value={form.startTime}
          onChange={(e) => updateField("startTime", e.target.value)}
          error={fieldErrors.startTime}
        />
        <FormField
          label="Ends"
          name="endTime"
          type="datetime-local"
          required
          value={form.endTime}
          onChange={(e) => updateField("endTime", e.target.value)}
          error={fieldErrors.endTime}
        />
      </div>

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Saving…" : isEdit ? "Save changes" : "Submit for approval"}
      </button>
    </form>
  );
}
