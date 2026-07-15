import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { ApiError } from "../../lib/apiError";

export function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      // Generic message on 401, per FINAL_TEAM_BUILD_GUIDE.md — never reveal which field was wrong.
      setError(err instanceof ApiError ? err.message : "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to continue to CampusOS.</p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>
      )}

      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-control mt-1.5"
          placeholder="you@campusos.edu"
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-control mt-1.5"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-slate-500">
        No account?{" "}
        <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
          Register
        </Link>
      </p>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5">
        <p className="font-mono text-[11px] leading-relaxed text-slate-500">
          demo · admin@campusos.edu · asha@campusos.edu · member@campusos.edu · faculty@campusos.edu
          <br />
          password: password123
        </p>
      </div>
    </form>
  );
}
