import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // Supabase pooler on port 5432 is Session mode, which fails on serverless environments like Vercel.
  // Switch to Transaction pooler on port 6543 and ensure pgbouncer=true.
  if (url.includes('pooler.supabase.com:5432')) {
    url = url.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543');
  }

  // Also catch direct connections to db.[project-ref].supabase.co:5432 if IPv4 is not supported
  // and convert port 6543 pooler URLs to include pgbouncer=true
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }

  // Ensure connection limit and timeouts are configured for serverless functions
  if (!url.includes('connection_limit')) {
    url += (url.includes('?') ? '&' : '?') + 'connection_limit=10&connect_timeout=30&pool_timeout=30';
  }

  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const resolvedUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

