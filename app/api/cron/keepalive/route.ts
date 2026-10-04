import { NextRequest, NextResponse } from 'next/server';
import {
  performKeepaliveCheck,
  formatHealthResponse,
  verifyCronAuthorization,
} from '@/lib/monitoring/keepalive';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Dedicated cron & scheduler keep-alive endpoint.
 * Invocations from Vercel Cron, GitHub Actions, or external schedulers
 * execute legitimate read-only queries against Supabase PostgreSQL and the REST gateway.
 *
 * Privileged operation:
 * Validated via CRON_SECRET in production (Bearer token or ?secret= query).
 * If database is unreachable, triggers throttled alert notification to admin.
 */
export async function GET(req: NextRequest) {
  // 1. Verify authorization
  const isAuthorized = verifyCronAuthorization(req);
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && cronSecret.trim().length > 0 && !isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing CRON_SECRET verification.' },
      { status: 401 }
    );
  }

  // 2. Perform activity check with alert dispatch enabled
  const result = await performKeepaliveCheck({ triggerAlert: true });
  const payload = formatHealthResponse(result, true);
  const statusCode = result.success ? 200 : 503;

  return NextResponse.json(payload, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
