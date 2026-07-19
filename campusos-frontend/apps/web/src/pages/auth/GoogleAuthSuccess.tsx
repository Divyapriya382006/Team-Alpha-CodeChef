import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../../lib/tokenStorage';

export function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    // Store token using exact same function as rest of app
    setToken(token);

    // Verify token by calling `/auth/me` (which matches what the rest of the app calls for getCurrentUser)
    const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');
    fetch(`${apiBase}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        // Full reload so AuthContext re-reads campusos_token from localStorage fresh
        window.location.href = '/';
      })
      .catch(() => {
        localStorage.removeItem('campusos_token');
        navigate('/login?error=google_failed', { replace: true });
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F0E8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 24,
        height: 24,
        backgroundColor: '#C8F135',
        border: '2px solid #0A0A0A',
      }} />
      <p style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: 14,
        color: '#0A0A0A',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: 0,
      }}>
        Signing you in...
      </p>
    </div>
  );
}
