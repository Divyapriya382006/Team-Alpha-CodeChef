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
        <h1 className="text-xl font-extrabold font-display text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to continue to CampusOS.</p>
      </div>

      {error && (
        <p className="border-2 border-[#FF3B3B] bg-[#FFF0F0] px-3 py-2 text-sm text-[#FF3B3B] font-semibold">{error}</p>
      )}

      <div>
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-control mt-1.5"
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
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted font-medium">
        No account?{" "}
        <Link to="/register" className="font-bold text-ink underline decoration-brand decoration-2 underline-offset-2">
          Register
        </Link>
      </p>

      <div className="border-2 border-ink p-3 bg-paper">
        <p className="font-mono text-[11px] leading-relaxed text-ink">
          demo · admin@campusos.edu · asha@campusos.edu · member@campusos.edu · faculty@campusos.edu
          <br />
          password: password123
        </p>
      </div>
    </form>
  );
}
