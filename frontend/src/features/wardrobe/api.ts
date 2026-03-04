import { z } from 'zod';
import type { WardrobeItem, CreateWardrobeItemInput, UpdateWardrobeItemInput, WardrobeFilters } from './types';
import { supabase } from '@/shared/api/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const wardrobeItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  category: z.string(),
  image_path: z.string().nullable(),
  labels: z.array(z.string()),
  colors: z.array(z.string()),
  seasons: z.array(z.string()),
  is_inspiration: z.boolean(),
  is_template: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
}) as unknown as z.ZodType<WardrobeItem>;

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }
  
  return session.access_token;
}

export async function fetchWardrobeItems(
  userId: string,
  filters?: WardrobeFilters
): Promise<WardrobeItem[]> {
  const token = await getAuthToken();
  const params = new URLSearchParams({ user_id: userId });
  
  if (filters?.category) {
    params.append('category', filters.category);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.colors && filters.colors.length > 0) {
    params.append('colors', filters.colors.join(','));
  }
  if (filters?.seasons && filters.seasons.length > 0) {
    params.append('seasons', filters.seasons.join(','));
  }
  
  const response = await fetch(`${API_BASE}/api/wardrobe/items?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch wardrobe items');
  }
  
  const data = await response.json();
  return z.array(wardrobeItemSchema).parse(data);
}

export async function fetchWardrobeItem(itemId: string, userId: string): Promise<WardrobeItem> {
  const token = await getAuthToken();
  const params = new URLSearchParams({ user_id: userId });
  
  const response = await fetch(`${API_BASE}/api/wardrobe/items/${itemId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch wardrobe item');
  }
  
  const data = await response.json();
  return wardrobeItemSchema.parse(data);
}

export async function createWardrobeItem(
  userId: string,
  input: CreateWardrobeItemInput
): Promise<WardrobeItem> {
  const token = await getAuthToken();
  
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('name', input.name);
  formData.append('category', input.category);
  if (input.labels && input.labels.length > 0) {
    formData.append('labels', input.labels.join(','));
  }
  if (input.colors && input.colors.length > 0) {
    formData.append('colors', input.colors.join(','));
  }
  if (input.seasons && input.seasons.length > 0) {
    formData.append('seasons', input.seasons.join(','));
  }
  if (input.imagePath) {
    formData.append('image_path', input.imagePath);
  }
  if (input.image) {
    formData.append('image', input.image);
  }
  
  const response = await fetch(`${API_BASE}/api/wardrobe/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create wardrobe item');
  }
  
  const data = await response.json();
  return wardrobeItemSchema.parse(data);
}

export async function updateWardrobeItem(
  itemId: string,
  userId: string,
  updates: UpdateWardrobeItemInput
): Promise<WardrobeItem> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/wardrobe/items/${itemId}?user_id=${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update wardrobe item');
  }
  
  const data = await response.json();
  return wardrobeItemSchema.parse(data);
}

export async function deleteWardrobeItem(itemId: string, userId: string): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/wardrobe/items/${itemId}?user_id=${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete wardrobe item');
  }
}

export function getItemImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  
  const { data } = supabase.storage.from('wardrobe').getPublicUrl(imagePath);
  
  return data.publicUrl;
}

export async function removeBackground(userId: string, image: File): Promise<{ processedImageUrl: string; storagePath: string }> {
  const token = await getAuthToken();
  
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('file', image);
  
  const response = await fetch(`${API_BASE}/api/image/remove-background`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to remove background');
  }
  
  const data = await response.json();
  return {
    processedImageUrl: data.processed_image_url,
    storagePath: data.storage_path,
  };
}

export interface AIAnalysisResult {
  suggested_name: string;
  suggested_category: string;
  colors: string[];
  seasons: string[];
  tags: string[];
  style: string[];
  material_guess: string;
  confidence: string;
}

export async function analyzeImage(image: File): Promise<AIAnalysisResult> {
  const token = await getAuthToken();
  
  const formData = new FormData();
  formData.append('file', image);
  
  const response = await fetch(`${API_BASE}/api/ai/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze image');
  }
  
  return await response.json();
}
