import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateProject, useEditProject, useProject } from "../../hooks/useProjects";
import { useClubDepartments } from "../../hooks/useDepartments";
import { FormField, FormSelect, FormTextarea } from "../../components/ui/FormField";
import { ChipInput } from "../../components/ui/ChipInput";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";
import type { ProjectStatus } from "../../types";

const EMPTY_FORM = {
  title: "",
  description: "",
  techStack: [] as string[],
  githubLink: "",
  demoLink: "",
  thumbnailUrl: "",
  contributors: [] as string[],
  status: "IN_PROGRESS" as ProjectStatus,
  departmentId: "",
};

// FINAL_TEAM_BUILD_GUIDE.md's "Create / Edit Project" page only lists one route
// (/clubs/:id/manage/projects/new) despite naming both modes and listing PATCH /projects/:id as
// a backend API used. A parallel :projectId/edit route is added here (see AppRoutes.tsx),
// mirroring the pattern the build guide already uses explicitly for Events.
export function ProjectForm() {
  const { id: clubId, projectId } = useParams<{ id: string; projectId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!projectId;

  const projectQuery = useProject(projectId);
  const departmentsQuery = useClubDepartments(clubId);
  const createProject = useCreateProject(clubId as string);
  const editProject = useEditProject(projectId as string);

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && projectQuery.data) {
      const p = projectQuery.data;
      setForm({
        title: p.title,
        description: p.description,
        techStack: p.techStack,
        githubLink: p.githubLink ?? "",
        demoLink: p.demoLink ?? "",
        thumbnailUrl: p.thumbnailUrl ?? "",
        contributors: p.contributors,
        status: p.status,
        departmentId: p.departmentId ?? "",
      });
    }
  }, [isEdit, projectQuery.data]);

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
      techStack: form.techStack,
      githubLink: form.githubLink || null,
      demoLink: form.demoLink || null,
      thumbnailUrl: form.thumbnailUrl || null,
      contributors: form.contributors,
      status: form.status,
      departmentId: form.departmentId || null,
    };

    try {
      if (isEdit) {
        await editProject.mutateAsync(payload);
        navigate(`/projects/${projectId}`);
      } else {
        const result = await createProject.mutateAsync(payload);
        navigate(`/projects/${result.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      else if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Something went wrong");
    }
  }

  if (isEdit && projectQuery.isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPending = isEdit ? editProject.isPending : createProject.isPending;

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-lg font-semibold">{isEdit ? "Edit project" : "Publish a project"}</h1>

      {formError && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{formError}</p>}

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
      <ChipInput
        label="Tech stack"
        name="techStack"
        value={form.techStack}
        onChange={(next) => updateField("techStack", next)}
        placeholder="Type a technology, press Enter"
      />
      <ChipInput
        label="Contributors"
        name="contributors"
        value={form.contributors}
        onChange={(next) => updateField("contributors", next)}
        placeholder="Type a name, press Enter"
        hint="Names only — MVP doesn't link contributors to accounts."
      />
      <FormSelect
        label="Status"
        name="status"
        value={form.status}
        onChange={(e) => updateField("status", e.target.value as ProjectStatus)}
        options={[
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "COMPLETED", label: "Completed" },
          { value: "ARCHIVED", label: "Archived" },
        ]}
      />
      <FormSelect
        label="Department (optional)"
        name="departmentId"
        value={form.departmentId}
        onChange={(e) => updateField("departmentId", e.target.value)}
        options={[
          { value: "", label: "No department" },
          ...(departmentsQuery.data?.map((d) => ({ value: d.id, label: d.name })) ?? []),
        ]}
      />
      <FormField
        label="GitHub link"
        name="githubLink"
        type="url"
        placeholder="https://…"
        value={form.githubLink}
        onChange={(e) => updateField("githubLink", e.target.value)}
        error={fieldErrors.githubLink}
      />
      <FormField
        label="Demo link"
        name="demoLink"
        type="url"
        placeholder="https://…"
        value={form.demoLink}
        onChange={(e) => updateField("demoLink", e.target.value)}
        error={fieldErrors.demoLink}
      />
      <FormField
        label="Thumbnail URL"
        name="thumbnailUrl"
        type="url"
        placeholder="https://…"
        value={form.thumbnailUrl}
        onChange={(e) => updateField("thumbnailUrl", e.target.value)}
        error={fieldErrors.thumbnailUrl}
      />

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Saving…" : isEdit ? "Save changes" : "Publish project"}
      </button>
    </form>
  );
}
