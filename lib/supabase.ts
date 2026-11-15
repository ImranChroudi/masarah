import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon && !url.includes('YOUR_PROJECT'));

export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anon || 'placeholder-anon-key'
);