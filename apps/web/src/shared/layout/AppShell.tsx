import { useEffect, useState } from 'react';
// import { Search, ShoppingBag, User } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '@/features/auth/store';

// Central navigation structure for the authenticated app.
// The order here defines the visual order in the header nav.
const primaryLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Wardrobe', to: '/wardrobe' },
  { label: 'Looks', to: '/looks' },
  { label: 'Builder', to: '/outfit-builder' },
];

/**
 * Shared layout shell for all authenticated routes.
 *
 * Renders a fixed header with primary nav and an <Outlet> for page content.
 * Adapts its behavior for two distinct modes:
 *
 * 1. Standard pages: header starts transparent and gains a blurred overlay
 *    backdrop on scroll (scrollY > 24px). This is the "luxury editorial"
 *    style from docs/design-docs/visual-style.md.
 *
 * 2. Outfit builder: header stays opaque with a hard border because the
 *    builder locks the viewport to 100dvh and disables body scroll.
 *    The `builder-active` class on <body> allows global CSS to participate
 *    in this mode (e.g. disabling scroll on html).
 *
 * Desktop-only — mobile layouts and hamburger nav are out of scope.
 * See ARCHITECTURE.md: "Desktop support starts at 1024px."
 */
export function AppShell() {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isBuilderRoute = location.pathname === '/outfit-builder';

  // Track scroll position to toggle the header's visual state.
  // Skipped on the builder route since the viewport is locked and scroll
  // events won't fire. The passive flag keeps scroll performance smooth.
  useEffect(() => {
    if (isBuilderRoute) return undefined;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll(); // Sync on mount in case the page loads mid-scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBuilderRoute]);

  // Toggle a body-level class so global CSS can participate in builder mode
  // (e.g. preventing overscroll on the document element).
  useEffect(() => {
    document.body.classList.toggle('builder-active', isBuilderRoute);

    return () => document.body.classList.remove('builder-active');
  }, [isBuilderRoute]);

  // Builder route OR scrolled → show chrome (border/backdrop). Otherwise transparent.
  const chromeActive = isBuilderRoute || isScrolled;

  return (
    <div
      className={clsx(
        'min-h-screen bg-[var(--bg)] text-[var(--text-primary)] page-enter',
        // Builder mode: lock to viewport height and disable overflow so the
        // canvas + controls fit within 100dvh. Uses dvh for mobile viewport
        // units but the app is desktop-only per ARCHITECTURE.md.
        isBuilderRoute && 'h-[100vh] h-[100dvh] overflow-hidden',
      )}
    >
      <header
        className={clsx(
          // Fixed positioning keeps the header above the page scroll container.
          // z-50 ensures it sits above all page content including modals.
          'fixed inset-x-0 top-0 z-50 h-[var(--header-h)] min-h-[var(--header-h)] max-h-[var(--header-h)] transition-all duration-500',
          chromeActive
            ? isBuilderRoute
              ? // Builder: opaque background with hard border (non-reactive header)
                'bg-[var(--bg)] border-b border-[var(--border)]'
              : // Standard scrolled: frosted glass effect via backdrop-blur
                'backdrop-blur-xl bg-[var(--surface-overlay)] border-b-0'
            : // Not scrolled: fully transparent, header content floats over the page
              'bg-transparent border-b border-transparent',
        )}
      >
        {/* Three-column grid: nav left, logo center, actions right */}
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--page-px)]">
          <nav aria-label="Primary" className="flex items-center gap-6">
            {primaryLinks.map((link) => (
              <NavItem key={link.to} to={link.to}>
                {link.label}
              </NavItem>
            ))}
          </nav>

          <NavLink
            to="/dashboard"
            className="justify-self-center text-center text-[13px] font-semibold uppercase tracking-[0.4em]"
          >
            Seamless
          </NavLink>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex border border-[var(--border)] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main
        className={clsx(
          // Default: scrollable page with padding below the fixed header
          'min-h-screen px-[var(--page-px)] pb-12 pt-[calc(var(--header-h)+24px)]',
          // Builder: fill remaining viewport below header, no padding, no scroll
          isBuilderRoute && 'h-[100vh] h-[100dvh] overflow-hidden px-0 pb-0 pt-[var(--header-h)]',
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}

interface NavItemProps {
  children: string;
  to: string;
}

/**
 * Navigation link with active-state styling.
 * Uses React Router's NavLink to automatically apply the underline + opacity
 * treatment when the current route matches. The `!underline` with
 * `underline-offset-4` creates the editorial underline from the style guide.
 */
function NavItem({ children, to }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'text-[11px] uppercase tracking-[0.24em] transition-all',
          isActive
            ? 'text-[var(--text-primary)] font-semibold opacity-100 !underline underline-offset-4'
            : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100',
        )
      }
    >
      {children}
    </NavLink>
  );
}
