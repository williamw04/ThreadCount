/**
 * Canonical wardrobe categories enforced by the backend API contract.
 * These values map directly to the `category` column in the `wardrobe_items` table
 * and are used as filter parameters in GET /api/wardrobe/items.
 * See docs/references/api-contracts.md § Categories.
 */
export type Category = 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories' | 'outerwear';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

/**
 * Core wardrobe item shape returned from the API.
 * `colors` and `seasons` are AI-detected by Gemini and stored as read-only metadata;
 * users cannot manually override these values through the edit modal.
 * `is_template` marks preloaded sample items seeded during onboarding.
 */
export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: Category;
  image_path: string | null;
  labels: string[];
  colors: string[];
  seasons: string[];
  is_inspiration: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWardrobeItemInput {
  name: string;
  category: Category;
  labels?: string[];
  colors?: string[];
  seasons?: string[];
  image?: File;
  imagePath?: string;
}

export interface UpdateWardrobeItemInput {
  name?: string;
  category?: Category;
  labels?: string[];
  colors?: string[];
  seasons?: string[];
}

/**
 * Server-side query parameters for GET /api/wardrobe/items.
 * Colors and seasons are sent as comma-separated strings per the API contract.
 */
export interface WardrobeFilters {
  category?: Category;
  search?: string;
  colors?: string[];
  seasons?: Season[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  shoes: 'Shoes',
  accessories: 'Accessories',
  outerwear: 'Outerwear',
};

export const CATEGORIES: Category[] = [
  'tops',
  'bottoms',
  'dresses',
  'shoes',
  'accessories',
  'outerwear',
];

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

/**
 * Preset color palette used by the color filter UI.
 * These names must match the color strings returned by the AI analysis endpoint
 * (POST /api/ai/analyze). The ColorFilter component maps these to hex values for display.
 */
export const COMMON_COLORS = [
  'black',
  'white',
  'gray',
  'navy',
  'blue',
  'red',
  'green',
  'yellow',
  'orange',
  'pink',
  'purple',
  'brown',
  'beige',
  'cream',
  'tan',
  'burgundy',
  'teal',
  'coral',
  'olive',
  'charcoal',
];
