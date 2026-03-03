import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/SignupForm';
import { useAuthStore } from '../store';

export function SignupPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
            Create your account
          </p>
        </div>

        {/* Thin rule */}
        <div className="border-t border-[var(--border-strong)] mb-10" />

        <SignupForm />

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
