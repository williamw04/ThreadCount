import { supabase } from '@/shared/api/supabase';
import type { LoginFormData, SignupFormData, AuthUser } from './types';

/**
 * Sign in with email and password via Supabase Auth.
 */
export async function loginWithEmail(data: LoginFormData): Promise<AuthUser> {
  const { data: result, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);
  if (!result.user) throw new Error('Login failed');

  return {
    id: result.user.id,
    email: result.user.email ?? '',
  };
}

/**
 * Sign up with email and password via Supabase Auth.
 */
export async function signupWithEmail(data: SignupFormData): Promise<AuthUser> {
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);
  if (!result.user) throw new Error('Signup failed');

  return {
    id: result.user.id,
    email: result.user.email ?? '',
  };
}

/**
 * Sign in with Google OAuth via Supabase Auth.
 * Redirects the user to Google's consent screen.
 */
export async function loginWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/onboarding`,
    },
  });

  if (error) throw new Error(error.message);
}

/**
 * Sign out the current user.
 */
export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
