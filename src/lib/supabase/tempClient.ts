import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * A throwaway Supabase client with no session persistence.
 * Used when the currently logged-in user (e.g. an employer) needs to
 * create a brand-new auth account for someone else (e.g. a candidate)
 * without that new signUp() call hijacking/replacing their own active session.
 */
export function createTempClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
