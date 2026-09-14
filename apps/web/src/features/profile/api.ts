/**
 * Profile and avatar API layer.
 *
 * Avatar processing pipeline:
 * 1. `uploadAvatarPhoto` — stores the original photo in `avatars/photos` bucket
 * 2. `createAvatar` — creates the DB record with `model_status: 'pending'`
 * 3. `processAvatar` — calls POST /api/avatar/generate to trigger fal.ai
 *    model canvas generation, then fetches the updated record
 *
 * The `ensureProfile` helper guarantees a `profiles` row exists before
 * creating an avatar, since the `avatars` table references `profiles(id)`.
 *
 * Avatar deletion is soft (`is_active: false`) to preserve referential integrity
 * with any generated images that reference the avatar.
 */

import { supabase } from '@/shared/api/supabase';
import type { Avatar } from './types';

export async function uploadAvatarPhoto(
  userId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/original.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

export async function processAvatar(userId: string): Promise<Avatar> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/avatar/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to generate avatar' }));
    throw new Error(error.detail || 'Failed to generate avatar');
  }

  const { data: updatedAvatar, error } = await supabase
    .from('avatars')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error('Failed to get updated avatar');
  }

  return updatedAvatar;
}

/**
 * Ensures a `profiles` row exists for the user. The profiles table uses
 * the auth user ID as its primary key (not a separate UUID), so this
 * function creates the row if it doesn't exist — typically needed
 * immediately after signup before avatar creation.
 */
async function ensureProfile(userId: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${fetchError.message}`);
  }

  if (!existing) {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, display_name: null });

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }
  }
}

export async function createAvatar(userId: string, photoPath: string): Promise<Avatar> {
  await ensureProfile(userId);

  const { data, error } = await supabase
    .from('avatars')
    .insert({
      user_id: userId,
      original_photo_path: photoPath,
      model_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create avatar: ${error.message}`);
  }

  return data;
}

export async function getAvatar(userId: string): Promise<Avatar | null> {
  const { data, error } = await supabase
    .from('avatars')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get avatar: ${error.message}`);
  }

  return data || null;
}

export async function deleteAvatar(avatarId: string): Promise<void> {
  const { error } = await supabase.from('avatars').update({ is_active: false }).eq('id', avatarId);

  if (error) {
    throw new Error(`Failed to delete avatar: ${error.message}`);
  }
}

export async function updateProfile(
  userId: string,
  updates: {
    display_name?: string;
    onboarding_completed?: boolean;
    tutorial_completed?: boolean;
  },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function getProfile(userId: string): Promise<{
  id: string;
  display_name: string | null;
  onboarding_completed: boolean;
  tutorial_completed: boolean;
} | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, onboarding_completed, tutorial_completed')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get profile: ${error.message}`);
  }

  return data || null;
}
