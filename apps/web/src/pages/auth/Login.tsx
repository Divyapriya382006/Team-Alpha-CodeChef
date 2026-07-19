import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const googleError = searchParams.get('error');

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

      {/* Google OAuth Button */}
      <div style={{marginBottom: 24}}>
        <a
          href={`${import.meta.env.VITE_API_URL}/api/v1/auth/google`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            width: '100%',
            padding: '12px 18px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #0A0A0A',
            boxShadow: '3px 3px 0px #0A0A0A',
            borderRadius: 0,
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#0A0A0A',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 80ms ease-out, box-shadow 80ms ease-out',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '1px 1px 0px #0A0A0A';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '3px 3px 0px #0A0A0A';
          }}
        >
          {/* Google SVG icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
        }}>
          <div style={{flex: 1, height: 2, backgroundColor: '#0A0A0A'}} />
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            color: '#555555',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            or
          </span>
          <div style={{flex: 1, height: 2, backgroundColor: '#0A0A0A'}} />
        </div>
      </div>

      {googleError && (
        <p style={{
          backgroundColor: '#FFF0F0',
          border: '2px solid #FF3B3B',
          color: '#FF3B3B',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          padding: '10px 14px',
          borderRadius: 0,
          marginBottom: 12,
        }}>
          Google sign-in failed. Please try again or use email/password.
        </p>
      )}

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
