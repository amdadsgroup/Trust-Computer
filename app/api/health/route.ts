import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Public health-check endpoint.
 * Returns strictly non-sensitive system status:
 * {
 *   "status": "ok",
 *   "database": "reachable",
 *   "timestamp": "2026-10-04T01:10:00.000Z"
 * }
 * Never exposes database URLs, credentials, tokens, or schema details.
 */
export async function GET(req: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ok',
        database: 'reachable',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'unreachable',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }
}

export async function HEAD(req: NextRequest) {
  const getRes = await GET(req);
  return new NextResponse(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}
