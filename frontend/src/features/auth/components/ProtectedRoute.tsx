import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const location = useLocation();

  // Wait for auth to resolve before deciding (prevents redirect race on OAuth callback)
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
