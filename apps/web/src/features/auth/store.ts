import { create } from 'zustand';
import { supabase } from '@/shared/api/supabase';
import type { AuthUser, LoginFormData, SignupFormData } from './types';
import { loginWithEmail, signupWithEmail, loginWithGoogle, logoutUser } from './api';

// Central auth state for the entire app. Components consume this via useAuthStore()
// selectors — prefer narrow selectors (e.g. `s.isAuthenticated`) to avoid unnecessary re-renders.
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // isInitialized guards against premature redirects. ProtectedRoute and pages wait
  // for this flag before making routing decisions, preventing a flash to /login on refresh.
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  // Returns an unsubscribe function — call it in useEffect cleanup at app root.
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginWithEmail(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signupWithEmail(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      set({ error: message, isLoading: false });
    }
  },

  loginGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await loginWithGoogle();
      // Don't set isLoading false — browser is redirecting to Google
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      set({ error: message, isLoading: false });
    }
  },

  // Always clears local state, even if the API call fails (e.g. network down).
  // This ensures the user is never stuck in a half-authenticated state.
  logout: async () => {
    try {
      await logoutUser();
    } catch {
      // Sign out locally even if API call fails
    }
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),

  /**
   * Subscribe to Supabase auth state changes.
   * Call once at app startup. Returns an unsubscribe function.
   */
  initialize: () => {
    // Subscribe to onAuthStateChange FIRST. This catches the OAuth redirect token
    // exchange that happens when the user returns from Google's consent screen.
    // The listener fires with a SIGNED_IN event and a valid session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          user: { id: session.user.id, email: session.user.email ?? '' },
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
      }
    });

    // Also check current session immediately. onAuthStateChange doesn't fire for
    // an existing session on page refresh — getSession() fills that gap so
    // isInitialized becomes true without waiting for a state change event.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({
          user: { id: session.user.id, email: session.user.email ?? '' },
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }
    });

    return () => subscription.unsubscribe();
  },
}));
