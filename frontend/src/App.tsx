import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { useAuthStore } from './features/auth/store';

export function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <AppRoutes />;
}
