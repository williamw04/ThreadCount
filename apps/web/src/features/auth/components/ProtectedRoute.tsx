import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

// Auth guard used as a route element wrapper. Renders child routes via <Outlet /> when
// authenticated, or redirects to /login preserving the attempted location for post-login redirect.
//
// The isInitialized check is critical: Supabase session restoration is async (especially
// after OAuth redirects), so without this guard the component would flash to /login before
// the session is loaded.
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const location = useLocation();

  // Wait for auth to resolve before deciding (prevents redirect race on OAuth callback)
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    // Preserve the attempted URL so LoginPage can redirect back after successful auth.
    // `replace` avoids adding /login to the history stack.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
