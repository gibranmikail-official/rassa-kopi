import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.replace(/\/rest\/v1$/i, '');
}

const rawUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://xgufrkztwrkinbtlbmzd.supabase.co';

export const SUPABASE_URL = normalizeSupabaseUrl(rawUrl);

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_q0BPG_zdUtMv5J6jllReOQ_IJkYAtQ7';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Ephemeral client with persistSession: false so a Super Admin can create
 * a new Email/Password account without overwriting their own active session.
 */
export function createEphemeralAuthClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'rassakopi-ephemeral-signup',
    },
  });
}
