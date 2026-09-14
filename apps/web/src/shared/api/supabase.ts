import { createClient } from '@supabase/supabase-js';

// Fail fast at module load if env vars are missing — this prevents silent
// auth failures that would surface as cryptic runtime errors downstream.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env.local and fill in the values from `supabase start`.',
  );
}

// Singleton Supabase client shared across the frontend.
// The anon key is safe to expose in the browser — Row Level Security (RLS)
// in Supabase restricts data access per user. See docs/guides/supabase-setup.md.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
