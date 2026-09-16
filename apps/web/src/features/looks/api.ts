/**
 * Looks API layer — aggregates two data sources into a unified `Look[]` array.
 *
 * Data sources:
 * 1. `fetchSavedOutfits` — GET /api/outfits, filtered client-side for uploaded photos
 *    (empty `item_ids` + populated `thumbnail_path`)
 * 2. `fetchGeneratedImages` — GET /api/generated-images, AI try-on results
 *
 * Both fetches run in parallel via `Promise.all`. Results are normalized with
 * a `type` discriminant and sorted by `created_at` descending (newest first).
 *
 * Deletion routes to the correct endpoint based on `look.type`:
 * - 'saved' → DELETE /api/outfits/{id}
 * - 'rendered' → DELETE /api/generated-images/{id}
 */

import { z } from 'zod';
import { supabase } from '@/shared/api/supabase';
import type { SavedOutfit, GeneratedImage, Look } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const savedOutfitSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string().nullable(),
  item_ids: z.array(z.string()),
  thumbnail_path: z.string().nullable(),
  created_at: z.string(),
}) as unknown as z.ZodType<SavedOutfit>;

const generatedImageSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  outfit_id: z.string().nullable(),
  image_url: z.string(),
  prompt: z.string().nullable(),
  created_at: z.string(),
}) as unknown as z.ZodType<GeneratedImage>;

async function getAuthToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  return session.access_token;
}

export async function fetchSavedOutfits(userId: string): Promise<SavedOutfit[]> {
  const token = await getAuthToken();
  const params = new URLSearchParams({ user_id: userId });

  const response = await fetch(`${API_BASE}/api/outfits?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch outfits');
  }

  const data = await response.json();
  const outfits = z.array(savedOutfitSchema).parse(data);

  return outfits.map((outfit) => ({
    ...outfit,
    type: 'saved' as const,
  }));
}

export async function fetchGeneratedImages(userId: string): Promise<GeneratedImage[]> {
  const token = await getAuthToken();
  const params = new URLSearchParams({ user_id: userId });

  const response = await fetch(`${API_BASE}/api/generated-images?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch generated images');
  }

  const data = await response.json();
  const images = z.array(generatedImageSchema).parse(data);

  return images.map((image) => ({
    ...image,
    type: 'rendered' as const,
  }));
}

/**
 * Fetches and merges both look sources in parallel.
 * Filters outfits client-side to only include uploaded photos (not composed outfits),
 * then combines with generated images and sorts newest-first.
 */
export async function fetchLooks(userId: string): Promise<Look[]> {
  const [outfits, generatedImages] = await Promise.all([
    fetchSavedOutfits(userId),
    fetchGeneratedImages(userId),
  ]);

  const savedOutfits = outfits.filter(
    (outfit) => outfit.thumbnail_path && outfit.item_ids.length === 0,
  );

  return [...savedOutfits, ...generatedImages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getOutfitImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;

  const { data } = supabase.storage.from('generated').getPublicUrl(imagePath);
  return data.publicUrl;
}

export async function deleteOutfit(outfitId: string, userId: string): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE}/api/outfits/${outfitId}?user_id=${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete outfit');
  }
}

export async function deleteGeneratedImage(imageId: string, userId: string): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE}/api/generated-images/${imageId}?user_id=${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete generated image');
  }
}

/**
 * Type-aware deletion — routes to the correct backend endpoint
 * based on whether the look is a saved outfit or a generated image.
 */
export async function deleteLook(look: Look, userId: string): Promise<void> {
  if (look.type === 'saved') {
    await deleteOutfit(look.id, userId);
  } else {
    await deleteGeneratedImage(look.id, userId);
  }
}
