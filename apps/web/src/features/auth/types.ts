import { z } from 'zod';

// --- Form Schemas (client-side validation) ---

// Zod schemas serve as the single source of truth for form validation.
// Types are inferred from schemas (below) so validation rules and types never drift apart.
// These are client-side only — the backend performs its own validation independently.
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Signup adds a confirmPassword field and uses .refine() for cross-field validation,
// which zod's standard .min/.max/etc. cannot express.
export const SignupSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// --- Types ---

// Inferred types flow from schemas, keeping form data shapes and validation in lockstep.
export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;

// Minimal user representation returned by auth operations.
// Kept intentionally small — richer profile data lives in the profile feature.
export interface AuthUser {
  id: string;
  email: string;
}
