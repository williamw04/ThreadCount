import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().nullable(),
  onboarding_completed: z.boolean().default(false),
  tutorial_completed: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

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
