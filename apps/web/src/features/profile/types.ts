import { z } from 'zod';

/**
 * Profile feature types — defined as Zod schemas for runtime validation.
 *
 * This feature currently has API code but no active route (the profile page
 * and onboarding flow are planned but not wired to the router). The types
 * and API functions are used by other features, particularly the auth flow
 * and avatar processing pipeline.
 *
 * See docs/features/user-profile/product-spec.md for the full feature scope.
 */

/**
 * User profile record from the `profiles` table.
 * Extends auth.users with app-specific fields.
 * `onboarding_completed` gates the onboarding redirect;
 * `tutorial_completed` tracks whether the user has seen the guided walkthrough.
 */
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().nullable(),
  onboarding_completed: z.boolean().default(false),
  tutorial_completed: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Avatar record from the `avatars` table.
 * `model_status` tracks the AI processing pipeline:
 *   pending → processing → ready | failed
 * The outfit builder's try-on feature requires `model_status: "ready"`.
 * `is_active` supports soft deletion — users can replace their avatar
 * without losing the record.
 */
export const AvatarSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  original_photo_path: z.string().nullable(),
  model_canvas_path: z.string().nullable(),
  model_status: z.enum(['pending', 'processing', 'ready', 'failed']).default('pending'),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Avatar = z.infer<typeof AvatarSchema>;
