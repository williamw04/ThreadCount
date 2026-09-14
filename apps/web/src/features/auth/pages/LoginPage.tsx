import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore } from '../store';
import { SurfaceMessage } from '@/shared/ui/SurfaceMessage';

// Login page — the two-column layout splits brand messaging (left) from the login form (right).
// If the user is already authenticated, they're immediately redirected to their intended
// destination (from location state) or /onboarding by default.
export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute stashes the original location in state.from before redirecting here.
  // After login, we send the user back there instead of a hardcoded default.
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/onboarding';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1480px] grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:gap-10">
        <section className="relative overflow-hidden border border-[var(--border)] bg-[var(--surface-inverse)] p-8 text-[var(--text-inverse)] shadow-[var(--shadow-floating)] sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_34%,rgba(255,255,255,0.08))]" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div className="space-y-6">
              <p className="eyebrow text-[var(--text-inverse)]/72">Seamless Wardrobe</p>
              <h1 className="max-w-3xl text-5xl font-semibold uppercase leading-[0.92] tracking-[0.08em] sm:text-6xl xl:text-7xl">
                Enter the wardrobe gallery.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[var(--text-inverse)]/72 sm:text-base">
                Build a personal fashion system with the restraint of a showroom and the precision
                of a fitting studio.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SurfaceMessage
                className="border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-left"
                kicker="Upload"
                title="Deep-etched wardrobe"
                description="Turn garments into clean library objects ready for styling, search, and composition."
              />
              <SurfaceMessage
                className="border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-left"
                kicker="Compose"
                title="Strictly framed outfits"
                description="Assemble silhouettes against a disciplined canvas with deliberate layering and balance."
              />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-10 shadow-[var(--shadow-panel)] sm:px-10 lg:px-14">
          <div className="w-full max-w-md space-y-8">
            <header className="space-y-4">
              <p className="eyebrow text-[var(--text-muted)]">Member access</p>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
                  Log in
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Continue into your private styling workspace.
                </p>
              </div>
              <hr className="luxury-rule" />
            </header>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
