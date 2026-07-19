import { useEffect, useState, type FormEvent } from "react";
import { useUpdateClub } from "../../../hooks/useClubs";
import { FormField, FormTextarea } from "../../../components/ui/FormField";
import { ApiError } from "../../../lib/apiError";
import type { Club, SocialLinks } from "../../../types";

interface ClubInfoFormProps {
  club: Club;
}

const SOCIAL_KEYS: (keyof SocialLinks)[] = ["instagram", "linkedin", "github", "website"];

export function ClubInfoForm({ club }: ClubInfoFormProps) {
  const updateClub = useUpdateClub(club.id);
  const [form, setForm] = useState({
    description: club.description,
    facultyDetails: club.facultyDetails,
    logoUrl: club.logoUrl ?? "",
    socialLinks: { ...club.socialLinks },
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      description: club.description,
      facultyDetails: club.facultyDetails,
      logoUrl: club.logoUrl ?? "",
      socialLinks: { ...club.socialLinks },
    });
  }, [club]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSaved(false);
    try {
      await updateClub.mutateAsync({
        description: form.description,
        facultyDetails: form.facultyDetails,
        logoUrl: form.logoUrl || null,
        socialLinks: form.socialLinks,
      });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      else if (err instanceof ApiError) setFormError(err.message);
      else setFormError("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface space-y-4 p-6">
      <h2 className="text-base font-semibold text-white">Club info</h2>

      {formError && <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{formError}</p>}
      {saved && !formError && (
        <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">Saved.</p>
      )}

      <FormTextarea
        label="Description"
        name="description"
        rows={3}
        value={form.description}
        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        error={fieldErrors.description}
      />
      <FormTextarea
        label="Faculty details"
        name="facultyDetails"
        rows={2}
        value={form.facultyDetails}
        onChange={(e) => setForm((p) => ({ ...p, facultyDetails: e.target.value }))}
        error={fieldErrors.facultyDetails}
      />
      <FormField
        label="Logo URL"
        name="logoUrl"
        type="url"
        placeholder="https://…"
        value={form.logoUrl}
        onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
        error={fieldErrors.logoUrl}
      />

      <div>
        <p className="field-label">Social links</p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOCIAL_KEYS.map((key) => (
            <FormField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              name={`social-${key}`}
              type="url"
              placeholder="https://…"
              value={form.socialLinks[key] ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))}
              error={fieldErrors[`socialLinks.${key}`]}
            />
          ))}
        </div>
      </div>

      <button type="submit" disabled={updateClub.isPending} className="btn-primary">
        {updateClub.isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
