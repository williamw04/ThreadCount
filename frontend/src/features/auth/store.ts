import { create } from 'zustand';
import { supabase } from '@/shared/api/supabase';
import type { AuthUser, LoginFormData, SignupFormData } from './types';
import { loginWithEmail, signupWithEmail, loginWithGoogle, logoutUser } from './api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
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
    // Listen for auth changes FIRST (catches the OAuth redirect token exchange)
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

    // Also check current session (handles page refresh with existing session)
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
