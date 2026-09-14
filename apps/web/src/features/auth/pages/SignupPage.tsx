import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/SignupForm';
import { useAuthStore } from '../store';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';

// Signup page — visually inverted from LoginPage: light panel on the left, dark form on the right.
// New users always go to /onboarding after signup (no location.state redirect since they
// haven't attempted any protected routes yet).
export function SignupPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1480px] grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:gap-10">
        <section className="relative overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] p-8 shadow-[var(--shadow-floating)] sm:p-12 lg:p-16">
          <div className="absolute inset-y-0 right-0 w-1/3 border-l border-[var(--border)] bg-[linear-gradient(180deg,rgba(17,17,17,0.04),transparent_70%)]" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div className="space-y-6">
              <p className="eyebrow text-[var(--text-muted)]">Private entry</p>
              <h1 className="max-w-3xl text-5xl font-semibold uppercase leading-[0.92] tracking-[0.08em] text-[var(--text-primary)] sm:text-6xl xl:text-7xl">
                Build the system before you build the look.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                Create your account to capture garments, arrange silhouettes, and generate a
                disciplined digital wardrobe.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SurfaceMessage
                className="text-left"
                kicker="Catalog"
                title="Garment-first organization"
                description="Preserve naming, categorization, and tags inside a strict monochrome framework."
              />
              <SurfaceMessage
                className="text-left"
                kicker="Avatar"
                title="Studio-grade onboarding"
                description="Prepare your model canvas once, then carry it through the styling workflow."
              />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center border border-[var(--border)] bg-[var(--surface-inverse)] px-6 py-10 text-[var(--text-inverse)] shadow-[var(--shadow-panel)] sm:px-10 lg:px-14">
          <div className="w-full max-w-md space-y-8">
            <header className="space-y-4">
              <p className="eyebrow text-[var(--text-inverse)]/72">Account creation</p>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
                  Sign up
                </h2>
                <p className="text-sm leading-6 text-[var(--text-inverse)]/72">
                  Establish your wardrobe and unlock the finished product surfaces.
                </p>
              </div>
              <hr className="border-0 border-t border-[rgba(255,255,255,0.18)]" />
            </header>

            <SignupForm />
          </div>
        </section>
      </div>
    </main>
  );
}
