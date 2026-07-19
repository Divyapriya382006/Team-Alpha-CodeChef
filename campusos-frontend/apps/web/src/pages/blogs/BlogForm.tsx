import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateBlog } from "../../hooks/useBlogs";
import { useClubDepartments } from "../../hooks/useDepartments";
import { FormField, FormSelect, FormTextarea } from "../../components/ui/FormField";
import { ChipInput } from "../../components/ui/ChipInput";
import { ApiError } from "../../lib/apiError";

const EMPTY_FORM = {
  title: "",
  content: "",
  tags: [] as string[],
  thumbnailUrl: "",
  departmentId: "",
};

// Create-only — FINAL_TEAM_BUILD_GUIDE.md's "Create Blog" page lists a single route and only
// POST /clubs/:id/blogs as its backend API, unlike Projects (which names PATCH /projects/:id
// too). No edit page is defined, so none is built here; PATCH /blogs/:id still exists at the
// API layer (lib/api/blogs.ts) for when/if that page gets specified.
export function BlogForm() {
  const { id: clubId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const departmentsQuery = useClubDepartments(clubId);
  const createBlog = useCreateBlog(clubId as string);

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function updateField<K extends keyof typeof EMPTY_FORM>(field: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    try {
      const result = await createBlog.mutateAsync({
        title: form.title,
        content: form.content,
        tags: form.tags,
        thumbnailUrl: form.thumbnailUrl || null,
        departmentId: form.departmentId || null,
      });
      navigate(`/blogs/${result.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      else if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-lg font-semibold">Publish a blog post</h1>

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
        label="Content"
        name="content"
        required
        rows={8}
        value={form.content}
        onChange={(e) => updateField("content", e.target.value)}
        error={fieldErrors.content}
      />
      <ChipInput label="Tags" name="tags" value={form.tags} onChange={(next) => updateField("tags", next)} placeholder="Type a tag, press Enter" />
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
        label="Thumbnail URL"
        name="thumbnailUrl"
        type="url"
        placeholder="https://…"
        value={form.thumbnailUrl}
        onChange={(e) => updateField("thumbnailUrl", e.target.value)}
        error={fieldErrors.thumbnailUrl}
      />

      <button type="submit" disabled={createBlog.isPending} className="btn-primary w-full">
        {createBlog.isPending ? "Publishing…" : "Publish blog"}
      </button>
    </form>
  );
}
