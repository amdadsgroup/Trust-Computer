import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;

  // In Cloudflare Workers runtime, secrets are exposed via getCloudflareContext().env
  if (!url) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCloudflareContext } = require('@opennextjs/cloudflare');
      const cfContext = getCloudflareContext();
      if (cfContext?.env?.DATABASE_URL) {
        url = cfContext.env.DATABASE_URL as string;
      }
    } catch {}
  }

  if (!url) return undefined;

  // Supabase pooler on port 5432 is Session mode; switch to port 6543 (transaction mode)
  if (url.includes('pooler.supabase.com:5432')) {
    url = url.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543');
  }

  // Ensure pgbouncer=true for PgBouncer pooler connections
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }

  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in runtime environment or Cloudflare context.');
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Lazy proxy to ensure Cloudflare Worker secrets are available on request handling
let cachedClient: PrismaClient | null = globalForPrisma.prisma ?? null;

function getClient(): PrismaClient {
  if (!cachedClient) {
    cachedClient = createPrismaClient();
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = cachedClient;
    }
  }
  return cachedClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
