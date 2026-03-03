import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore } from '../store';

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/onboarding';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Editorial heading */}
        <div className="mb-12 text-center">
          <h1
            className="text-5xl tracking-tight text-[var(--text-primary)] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Seamless
          </h1>
          <p
            className="text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Your digital wardrobe
          </p>
        </div>

        {/* Thin rule */}
        <div className="border-t border-[var(--border-strong)] mb-10" />

        <LoginForm />

        {/* Bottom rule */}
        <div className="border-t border-[var(--border)] mt-16" />
        <p
          className="text-center text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mt-4"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Style without limits
        </p>
      </div>
    </div>
  );
}
