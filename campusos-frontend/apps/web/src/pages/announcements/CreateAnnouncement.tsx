import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useCreateAnnouncement } from "../../hooks/useAnnouncements";
import { useMyDepartmentHeadships } from "../../hooks/useDepartments";
import { FormField, FormSelect, FormTextarea } from "../../components/ui/FormField";
import { ApiError } from "../../lib/apiError";
import type { AnnouncementVisibility } from "../../types";

export function CreateAnnouncement() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const createAnnouncement = useCreateAnnouncement();

  const headedClubs = user?.clubMemberships.filter((m) => m.role === "CLUB_HEAD") ?? [];
  const isSuperAdmin = user?.platformRole === "SUPER_ADMIN";

  // A department belongs to exactly one club, and a membership carries at most one department ref
  // — so "which department" already fully determines "which club." Offering a separate Club
  // dropdown here was pure redundancy. Real headship (not just membership) is checked the same way
  // as the Profile page's Department Head badge, since Create permission is "that department's
  // Head" specifically (FINAL_TEAM_BUILD_GUIDE.md line 377), not just any member of it.
  const departmentMemberships = (user?.clubMemberships ?? [])
    .filter((m) => m.department)
    .map((m) => ({ clubId: m.clubId, clubName: m.clubName, departmentId: m.department!.id, departmentName: m.department!.name }));
  const headDepartmentIds = useMyDepartmentHeadships(
    departmentMemberships.map((d) => d.departmentId),
    user?.id,
  );
  const headedDepartments = departmentMemberships.filter((d) => headDepartmentIds.has(d.departmentId));

  // A Visibility *choice* only makes sense for someone who could plausibly pick more than one
  // level — Super Admin (Global) or a Club Head (Club, and Department if they also head one).
  // A user who is ONLY a Department Head (no club headship, no admin) has exactly one possible
  // visibility, so making them pick it from a dropdown is a pointless extra step — they go
  // straight to picking which department, which matters when they head more than one across
  // different clubs.
  const isPureDepartmentHead = !isSuperAdmin && headedClubs.length === 0 && headedDepartments.length > 0;
  const canPostAnything = isSuperAdmin || headedClubs.length > 0 || headedDepartments.length > 0;

  const visibilityOptions: { value: AnnouncementVisibility; label: string }[] = [
    ...(isSuperAdmin ? [{ value: "GLOBAL" as const, label: "Global — everyone" }] : []),
    ...(headedClubs.length > 0 ? [{ value: "CLUB" as const, label: "Club — your members" }] : []),
    ...(headedClubs.length > 0 && headedDepartments.length > 0 ? [{ value: "DEPARTMENT" as const, label: "Department — your department" }] : []),
  ];

  // visibilityOptions depends on an async headship check (useMyDepartmentHeadships), so it isn't
  // known yet at mount — a plain useState initializer would lock in "" before the real options
  // exist. Deriving the effective value every render (falling back to the first valid option)
  // keeps the selection correct once the query resolves, while still letting onChange override it.
  const [manualVisibility, setManualVisibility] = useState<AnnouncementVisibility | "">("");
  const visibility = isPureDepartmentHead
    ? "DEPARTMENT"
    : visibilityOptions.some((o) => o.value === manualVisibility)
      ? manualVisibility
      : (visibilityOptions[0]?.value ?? "");
  const [clubId, setClubId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    if (!visibility) return;

    try {
      await createAnnouncement.mutateAsync({
        title,
        content,
        visibility,
        clubId: visibility === "CLUB" ? clubId : undefined,
        departmentId: visibility === "DEPARTMENT" ? departmentId : undefined,
      });
      navigate("/announcements");
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      else if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Something went wrong");
    }
  }

  if (!canPostAnything) {
    return (
      <p className="text-sm text-muted">
        You don't currently hold a role that can post announcements (Super Admin, Club Head, or Department Head).
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-lg font-semibold">New announcement</h1>

      {formError && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{formError}</p>}

      {!isPureDepartmentHead && (
        <FormSelect
          label="Visibility"
          name="visibility"
          value={visibility}
          onChange={(e) => {
            setManualVisibility(e.target.value as AnnouncementVisibility);
            setClubId("");
            setDepartmentId("");
          }}
          options={visibilityOptions}
        />
      )}

      {visibility === "CLUB" && (
        <FormSelect
          label="Club"
          name="clubId"
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
          error={fieldErrors.clubId}
          options={[{ value: "", label: "Select a club" }, ...headedClubs.map((m) => ({ value: m.clubId, label: m.clubName }))]}
        />
      )}

      {visibility === "DEPARTMENT" && (
        <FormSelect
          label="Department"
          name="departmentId"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          error={fieldErrors.departmentId}
          options={[
            { value: "", label: "Select a department" },
            ...headedDepartments.map((d) => ({ value: d.departmentId, label: `${d.clubName} — ${d.departmentName}` })),
          ]}
        />
      )}

      <FormField label="Title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.title} />
      <FormTextarea
        label="Content"
        name="content"
        required
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={fieldErrors.content}
      />

      <button type="submit" disabled={createAnnouncement.isPending} className="btn-primary w-full">
        {createAnnouncement.isPending ? "Posting…" : "Post announcement"}
      </button>
    </form>
  );
}
