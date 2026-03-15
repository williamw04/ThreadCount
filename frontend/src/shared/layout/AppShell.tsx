import { useEffect, useState } from 'react';
import { Search, ShoppingBag, User } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '@/features/auth/store';

const primaryLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Wardrobe', to: '/wardrobe' },
  { label: 'Builder', to: '/outfit-builder' },
];

const utilityLinks = [
  { label: 'Search wardrobe', to: '/wardrobe', icon: Search },
  { label: 'Account dashboard', to: '/dashboard', icon: User },
  { label: 'Saved outfit builder', to: '/outfit-builder', icon: ShoppingBag },
];

export function AppShell() {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isBuilderRoute = location.pathname === '/outfit-builder';

  useEffect(() => {
    if (isBuilderRoute) {
      setIsScrolled(false);
      return undefined;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBuilderRoute]);

  useEffect(() => {
    document.body.classList.toggle('builder-active', isBuilderRoute);

    return () => document.body.classList.remove('builder-active');
  }, [isBuilderRoute]);

  const chromeActive = isBuilderRoute || isScrolled;

  return (
    <div
      className={clsx(
        'min-h-screen bg-[var(--bg)] text-[var(--text-primary)] page-enter',
        isBuilderRoute && 'h-[100vh] h-[100dvh] overflow-hidden',
      )}
    >
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 h-[var(--header-h)] min-h-[var(--header-h)] max-h-[var(--header-h)] transition-all duration-500',
          chromeActive
            ? isBuilderRoute
              ? 'bg-[var(--bg)] border-b border-[var(--border)]'
              : 'backdrop-blur-xl bg-[var(--surface-overlay)] border-b-0'
            : 'bg-transparent border-b border-transparent',
        )}
      >
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
            {utilityLinks.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center border border-transparent text-[var(--text-primary)] transition-all hover:border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              >
                <Icon size={16} strokeWidth={1.25} />
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex border border-[var(--border)] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main
        className={clsx(
          'min-h-screen px-[var(--page-px)] pb-12 pt-[calc(var(--header-h)+24px)]',
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

function NavItem({ children, to }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'text-[11px] uppercase tracking-[0.24em] transition-opacity hover:opacity-60',
          isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
        )
      }
    >
      {children}
    </NavLink>
  );
}
