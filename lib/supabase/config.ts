/**
 * Supabase configuration and environment checks
 */

function getEnv(key: string): string {
  let val = process.env[key] || '';
  if (!val) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCloudflareContext } = require('@opennextjs/cloudflare');
      const cfContext = getCloudflareContext();
      if (cfContext?.env?.[key]) {
        val = cfContext.env[key] as string;
      }
    } catch {}
  }
  return val;
}

export const SUPABASE_URL =
  getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnv('SUPABASE_URL');

export const SUPABASE_ANON_KEY =
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnv('SUPABASE_ANON_KEY');

export const SUPABASE_SERVICE_ROLE_KEY =
  getEnv('SUPABASE_SERVICE_ROLE_KEY');

export const SUPABASE_BUCKET_NAME =
  getEnv('SUPABASE_BUCKET_NAME') ||
  'product-images';

export const isSupabaseConfigured = (): boolean => {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
  const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
  return (
    typeof url === 'string' &&
    url.startsWith('http') &&
    typeof anonKey === 'string' &&
    anonKey.length > 20
  );
};
