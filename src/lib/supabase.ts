// Infrastructure layer: Supabase client initialization only.
// Domain types live in src/types/event.ts — do NOT add types here.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your deployment platform (Netlify/Vercel) or .env file.'
  );
}

// Initialize with fallback strings if missing to avoid immediate crash, 
// though actual calls will still fail until keys are provided.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

