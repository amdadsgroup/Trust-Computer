import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://icjuiykdcoemxtqgdqzk.supabase.co';
const FALLBACK_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljanVpeWtkY29lbXh0cWdkcXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIzNjIxOCwiZXhwIjoyMTA1ODEyMjE4fQ.tLfCbiaC1qmsvLjSlr69GFkLz6GbIW6QAFlgYI4I5Z0';

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

export function createAdminClient() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL') || FALLBACK_SUPABASE_URL;
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || FALLBACK_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

