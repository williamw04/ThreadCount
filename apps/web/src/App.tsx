import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { useAuthStore } from './features/auth/store';

/**
 * Root application component.
 *
 * Runs auth initialization once on mount — this sets up the Supabase
 * onAuthStateChange listener and hydrates the auth store with the current
 * session. The listener's cleanup function is returned so it unsubscribes
 * on unmount. See features/auth/store for the full auth flow.
 */
export function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <AppRoutes />;
}
