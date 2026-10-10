import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface EnvLookup {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

function resolveEnvironment(): EnvLookup {
  const globalObj = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  const nodeEnv = globalObj.process?.env || {};
  const metaEnv = typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: EnvLookup }).env
    : undefined;

  return {
    VITE_SUPABASE_URL: metaEnv?.VITE_SUPABASE_URL || nodeEnv.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: metaEnv?.VITE_SUPABASE_ANON_KEY || nodeEnv.VITE_SUPABASE_ANON_KEY,
  };
}

const env = resolveEnvironment();
const rawUrl = (env.VITE_SUPABASE_URL || '').trim();
const rawAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

function isValidSupabaseUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawAnonKey &&
  isValidSupabaseUrl(rawUrl) &&
  !rawUrl.includes('your-project-id') &&
  rawAnonKey !== 'your-anon-key-here' &&
  rawAnonKey.length > 20
);

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err);
    clientInstance = null;
  }
}

export const supabase = clientInstance;
