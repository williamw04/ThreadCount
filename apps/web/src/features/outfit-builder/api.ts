/**
 * Outfit builder API layer.
 *
 * Outfit CRUD operations (fetch, create, update, delete) go through Supabase
 * directly against the `outfits` table. This is because outfits are a simple
 * data model with no server-side processing required for basic operations.
 *
 * Try-on generation and thumbnail creation use the REST API (POST /api/try-on/generate
 * and POST /api/outfits/generate-thumbnail) because they require backend AI services
 * and return URLs to generated images in the `generated` Supabase bucket.
 */

import { supabase } from '@/shared/api/supabase';
import type { Outfit, OutfitCreateInput, OutfitUpdateInput } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchOutfits(userId: string): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchOutfit(outfitId: string, userId: string): Promise<Outfit | null> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('id', outfitId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data;
}

export async function createOutfit(userId: string, input: OutfitCreateInput): Promise<Outfit> {
  const { data, error } = await supabase
    .from('outfits')
    .insert({
      user_id: userId,
      name: input.name || null,
      item_ids: input.item_ids,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOutfit(
  outfitId: string,
  userId: string,
  updates: OutfitUpdateInput,
): Promise<Outfit> {
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.item_ids !== undefined) updateData.item_ids = updates.item_ids;

  const { data, error } = await supabase
    .from('outfits')
    .update(updateData)
    .eq('id', outfitId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOutfit(outfitId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('outfits')
    .delete()
    .eq('id', outfitId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function fetchOutfitItems(itemIds: string[]) {
  if (itemIds.length === 0) return [];

  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('id, name, category, image_path')
    .in('id', itemIds);

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Public URL for a wardrobe item image in the `wardrobe` bucket.
 * Used by the canvas and wardrobe panel to render garment imagery.
 */
export function getItemImageUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from('wardrobe').getPublicUrl(path);
  return data.publicUrl;
}

export interface TryOnResult {
  status: string;
  image_id: string;
  image_path: string;
  image_url: string;
}

/**
 * Triggers AI try-on generation. Requires the user to have an avatar
 * with `model_status: "ready"`. Returns the generated image URL immediately
 * (synchronous response from the backend). May take 10-30+ seconds.
 * See docs/references/api-contracts.md § Try-On.
 */
export async function generateTryOn(
  userId: string,
  itemIds: string[],
  outfitId?: string,
): Promise<TryOnResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/try-on/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      item_ids: itemIds,
      outfit_id: outfitId || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to generate try-on' }));
    throw new Error(error.detail || 'Failed to generate try-on');
  }

  return response.json();
}

/**
 * Public URL for an AI-generated image in the `generated` bucket.
 * Used for both try-on renders and outfit thumbnails.
 */
export function getGeneratedImageUrl(path: string): string {
  const { data } = supabase.storage.from('generated').getPublicUrl(path);
  return data.publicUrl;
}

export interface ThumbnailResult {
  status: string;
  thumbnail_path: string;
  thumbnail_url: string;
}

export async function generateOutfitThumbnail(
  userId: string,
  itemIds: string[],
): Promise<ThumbnailResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/outfits/generate-thumbnail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      item_ids: itemIds,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to generate thumbnail' }));
    throw new Error(error.detail || 'Failed to generate thumbnail');
  }

  return response.json();
}
