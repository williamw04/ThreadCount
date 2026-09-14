/**
 * Looks feature types.
 *
 * A "look" is a union type representing either a user-uploaded outfit photo
 * (SavedOutfit) or an AI-generated try-on render (GeneratedImage). The `type`
 * discriminant field enables type-safe handling in components and API calls.
 *
 * These types come from two separate backend data sources:
 * - `outfits` table (where `item_ids` is empty and `thumbnail_path` is populated)
 * - `generated_images` table (AI try-on results)
 *
 * See docs/features/previous-looks/design.md § Data Aggregation Strategy.
 */

export type LookType = 'saved' | 'rendered';

export type LookFilter = 'all' | LookType;

/**
 * User-uploaded outfit photo. Distinguished from composed outfits by
 * having empty `item_ids` and a populated `thumbnail_path`.
 */
export interface SavedOutfit {
  id: string;
  user_id: string;
  name: string | null;
  item_ids: string[];
  thumbnail_path: string | null;
  created_at: string;
  type: 'saved';
}

/**
 * AI-generated try-on image from the `generated_images` table.
 * `image_url` is the public URL in the `generated` Supabase bucket.
 * `outfit_id` links back to the outfit that was used for generation (optional).
 */
export interface GeneratedImage {
  id: string;
  user_id: string;
  outfit_id: string | null;
  image_url: string;
  prompt: string | null;
  created_at: string;
  type: 'rendered';
}

export type Look = SavedOutfit | GeneratedImage;

export interface LooksState {
  looks: Look[];
  filter: LookFilter;
  isLoading: boolean;
  error: string | null;
}

export const LOOK_FILTERS: { value: LookFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved Outfits' },
  { value: 'rendered', label: 'Renders' },
];
