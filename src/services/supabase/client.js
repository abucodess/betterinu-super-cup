import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://jfrkwpfspegukftzekjr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YOYOr8lr0KoZyJRR9RdM2A_hi0529y9';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholderUrl =
  !rawUrl ||
  rawUrl.includes('your-project.supabase.co') ||
  rawUrl.includes('placeholder.supabase.co');

const isPlaceholderKey =
  !rawKey ||
  rawKey.includes('your-anon-key') ||
  rawKey.includes('placeholder');

const supabaseUrl = isPlaceholderUrl ? DEFAULT_SUPABASE_URL : rawUrl;
const supabaseAnonKey = isPlaceholderKey ? DEFAULT_SUPABASE_ANON_KEY : rawKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
