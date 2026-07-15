import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { ApiError } from "../../lib/apiError";

export function Register() {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
      } else if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join CampusOS to browse, join, and build with campus clubs.</p>
      </div>

      {formError && (
        <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{formError}</p>
      )}

      <div>
        <label htmlFor="name" className="field-label">
          Name
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="field-control mt-1.5"
          placeholder="Asha Rao"
        />
        {fieldErrors.name && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="field-control mt-1.5"
          placeholder="you@campusos.edu"
        />
        {fieldErrors.email && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          className="field-control mt-1.5"
          placeholder="••••••••"
        />
        {fieldErrors.password && <p className="mt-1.5 text-xs text-rose-400">{fieldErrors.password}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
          Log in
        </Link>
      </p>
    </form>
  );
}
