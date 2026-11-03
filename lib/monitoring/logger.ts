/**
 * Trust Computer — Lightweight Production Performance Logger & Monitor
 * Logs slow operations and errors with automated secret/PII redaction.
 * Zero-overhead, zero-dependency.
 */

const SLOW_THRESHOLD_MS = 1000; // Log queries/requests taking longer than 1s

// Redact known sensitive keys from logged objects
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'service_role',
  'anon_key',
  'creditcard',
  'customerphone',
  'customeremail',
]);

export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeLogData);

  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      cleaned[key] = sanitizeLogData(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

/**
 * Measure execution duration of asynchronous tasks (DB queries, external API calls)
 */
export async function trackExecutionTime<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    if (duration > SLOW_THRESHOLD_MS) {
      console.warn(
        `[PERF WARN] Slow operation detected: "${operationName}" took ${duration.toFixed(0)}ms`
      );
    }

    return result;
  } catch (error: any) {
    const duration = performance.now() - start;
    console.error(
      `[PERF ERROR] Operation "${operationName}" failed after ${duration.toFixed(0)}ms:`,
      error?.message || error
    );
    throw error;
  }
}

/**
 * Log API route completion with performance metrics
 */
export function logApiMetric(params: {
  endpoint: string;
  method: string;
  durationMs: number;
  status: number;
}) {
  const { endpoint, method, durationMs, status } = params;
  if (durationMs > SLOW_THRESHOLD_MS || status >= 400) {
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    console.log(
      `[API ${level}] ${method} ${endpoint} - ${status} (${durationMs.toFixed(0)}ms)`
    );
  }
}

