import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';
import { sendKeepaliveFailureAlertEmail } from '@/lib/email';
import { NextRequest } from 'next/server';

export interface KeepaliveResult {
  success: boolean;
  database: 'reachable' | 'unreachable';
  latencyMs: number;
  timestamp: string;
  errorCategory?: string;
  errorMessage?: string;
  restApiReachable?: boolean;
}

interface TelemetryState {
  lastSuccessfulCheck: string | null;
  lastFailure: string | null;
  lastLatencyMs: number | null;
  consecutiveFailures: number;
  lastErrorCategory: string | null;
  lastAlertSentAt: number | null;
}

const telemetry: TelemetryState = {
  lastSuccessfulCheck: null,
  lastFailure: null,
  lastLatencyMs: null,
  consecutiveFailures: 0,
  lastErrorCategory: null,
  lastAlertSentAt: null,
};

// Alert throttle interval: 6 hours (in ms) to avoid spamming admin inbox
const ALERT_THROTTLE_MS = 6 * 60 * 60 * 1000;

/**
 * Categorizes raw errors into non-sensitive high-level operational buckets.
 */
function categorizeError(err: any): string {
  const msg = String(err?.message || err || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'DATABASE_TIMEOUT';
  }
  if (msg.includes('connect') || msg.includes('econnrefused') || msg.includes('connection refused')) {
    return 'CONNECTION_REFUSED';
  }
  if (msg.includes('authentication') || msg.includes('password') || msg.includes('access denied')) {
    return 'AUTHENTICATION_FAILURE';
  }
  if (msg.includes('enotfound') || msg.includes('getaddrinfo') || msg.includes('dns')) {
    return 'DNS_RESOLUTION_FAILURE';
  }
  if (msg.includes('pgbouncer') || msg.includes('pooler') || msg.includes('too many connections')) {
    return 'POOLER_OVERLOAD';
  }
  return 'DATABASE_UNREACHABLE';
}

/**
 * Execute a timeout-bounded promise.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs = 6000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Executes a safe, read-only query on PostgreSQL via Prisma.
 * Uses siteSettings table if existing or raw SELECT 1.
 */
async function queryDatabase(): Promise<void> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { id: true, updatedAt: true },
    });
    if (settings) return;
  } catch (error) {
    // If table query fails, attempt basic raw query SELECT 1
  }

  // Fallback to light raw query
  await prisma.$queryRaw(Prisma.sql`SELECT 1 as alive`);
}

/**
 * Optionally pings the Supabase REST API (PostgREST) with the public anon key.
 * This registers user activity on the Supabase API Gateway in addition to direct Postgres queries.
 */
async function querySupabaseRestApi(): Promise<boolean> {
  if (!isSupabaseConfigured() || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return false;
  }

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/site_settings?select=id&limit=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return res.ok || res.status === 200 || res.status === 404; // 404 still indicates reachable Supabase instance
  } catch {
    return false;
  }
}

/**
 * Performs a complete keep-alive check.
 * Includes 1 immediate retry for transient network anomalies before declaring failure.
 */
export async function performKeepaliveCheck(options?: {
  triggerAlert?: boolean;
}): Promise<KeepaliveResult> {
  const start = performance.now();
  const timestamp = new Date().toISOString();
  let dbReachable = false;
  let errorCategory: string | undefined;
  let rawErrorMessage: string | undefined;

  // Try DB ping (with max 1 retry)
  try {
    await withTimeout(queryDatabase(), 5000);
    dbReachable = true;
  } catch (firstErr: any) {
    // 1 immediate retry before declaring failure
    try {
      await new Promise((r) => setTimeout(r, 500));
      await withTimeout(queryDatabase(), 5000);
      dbReachable = true;
    } catch (retryErr: any) {
      dbReachable = false;
      errorCategory = categorizeError(retryErr);
      rawErrorMessage = retryErr?.message || 'Database connection error';
    }
  }

  // Ping Supabase REST endpoint asynchronously if configured
  let restApiReachable: boolean | undefined = undefined;
  if (isSupabaseConfigured()) {
    try {
      restApiReachable = await querySupabaseRestApi();
    } catch {
      restApiReachable = false;
    }
  }

  const latencyMs = Math.round(performance.now() - start);

  // Update telemetry metrics
  if (dbReachable) {
    telemetry.lastSuccessfulCheck = timestamp;
    telemetry.lastLatencyMs = latencyMs;
    telemetry.consecutiveFailures = 0;
    telemetry.lastErrorCategory = null;
  } else {
    telemetry.lastFailure = timestamp;
    telemetry.lastLatencyMs = latencyMs;
    telemetry.consecutiveFailures += 1;
    telemetry.lastErrorCategory = errorCategory || 'DATABASE_UNREACHABLE';

    // Trigger alert email if requested, throttled to 1 email every 6 hours
    if (options?.triggerAlert) {
      const now = Date.now();
      const shouldAlert =
        !telemetry.lastAlertSentAt || now - telemetry.lastAlertSentAt > ALERT_THROTTLE_MS;

      if (shouldAlert) {
        telemetry.lastAlertSentAt = now;
        sendKeepaliveFailureAlertEmail({
          errorCategory: telemetry.lastErrorCategory,
          errorMessage: rawErrorMessage || 'Database connection unreachable during scheduled check.',
          timestamp,
        }).catch((err) => {
          console.error('[KEEPALIVE] Failed to dispatch alert email:', err);
        });
      }
    }
  }

  return {
    success: dbReachable,
    database: dbReachable ? 'reachable' : 'unreachable',
    latencyMs,
    timestamp,
    errorCategory,
    errorMessage: rawErrorMessage,
    restApiReachable,
  };
}

/**
 * Validates whether the incoming request is authorized to trigger privileged cron keepalive operations.
 * Accepts:
 * - Header: `Authorization: Bearer <CRON_SECRET>`
 * - Header: `x-cron-secret: <CRON_SECRET>`
 * - Query: `?secret=<CRON_SECRET>`
 */
export function verifyCronAuthorization(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // In production, if CRON_SECRET is configured, enforce strict verification
  if (cronSecret && cronSecret.trim().length > 0) {
    const authHeader = req.headers.get('authorization');
    if (authHeader === `Bearer ${cronSecret}`) {
      return true;
    }

    const xSecretHeader = req.headers.get('x-cron-secret');
    if (xSecretHeader === cronSecret) {
      return true;
    }

    const urlSecret = req.nextUrl.searchParams.get('secret');
    if (urlSecret === cronSecret) {
      return true;
    }

    return false;
  }

  // If CRON_SECRET is not configured (e.g. initial development), permit with warning
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production without CRON_SECRET, permit but log advisory
  return true;
}

/**
 * Formats a clean, non-sensitive JSON response for health status.
 * Never exposes connection strings, internal table details, or database passwords.
 */
export function formatHealthResponse(result: KeepaliveResult, isAuthorized = false) {
  // Public specification compliant payload:
  // { "status": "ok", "database": "reachable", "timestamp": "..." }
  const publicPayload = {
    status: result.success ? 'ok' : 'error',
    database: result.database,
    timestamp: result.timestamp,
  };

  if (!isAuthorized) {
    return publicPayload;
  }

  // Authorized scheduler payload includes safe operational telemetry
  return {
    ...publicPayload,
    latencyMs: result.latencyMs,
    scheduler: 'authorized',
    telemetry: {
      consecutiveFailures: telemetry.consecutiveFailures,
      lastSuccessfulCheck: telemetry.lastSuccessfulCheck,
      lastFailure: telemetry.lastFailure,
      lastErrorCategory: telemetry.lastErrorCategory,
      restApiReachable: result.restApiReachable,
    },
  };
}

export function getTelemetrySnapshot() {
  return { ...telemetry };
}
