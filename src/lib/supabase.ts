import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
      'Running with a placeholder client so the UI still renders -- any Supabase-backed ' +
      'features (auth, data, etc.) will not work until .env.local is set up.'
  );
}

// Fall back to harmless placeholder values so createClient() never throws when
// env vars are missing -- this lets the app mount and render purely for local
// UI/design work, even without a real Supabase project connected.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
