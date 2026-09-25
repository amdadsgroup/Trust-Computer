/**
 * Supabase configuration and environment checks
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

export const SUPABASE_BUCKET_NAME =
  process.env.SUPABASE_BUCKET_NAME ||
  'trust-computer-assets';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.startsWith('http') &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.length > 20
  );
};
