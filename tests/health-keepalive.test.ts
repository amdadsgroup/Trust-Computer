import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  formatHealthResponse,
  verifyCronAuthorization,
  performKeepaliveCheck,
  type KeepaliveResult,
} from '../lib/monitoring/keepalive';
import { GET as healthGet, HEAD as healthHead } from '../app/api/health/route';
import { GET as cronGet } from '../app/api/cron/keepalive/route';

describe('Supabase Keep-Alive & Health Monitoring', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Response Payload Sanitization & Specification Compliance', () => {
    it('produces the exact required JSON schema for public endpoints when database is reachable', () => {
      const mockResult: KeepaliveResult = {
        success: true,
        database: 'reachable',
        latencyMs: 24,
        timestamp: '2026-10-04T01:10:00.000Z',
      };

      const formatted = formatHealthResponse(mockResult, false);

      expect(formatted).toEqual({
        status: 'ok',
        database: 'reachable',
        timestamp: '2026-10-04T01:10:00.000Z',
      });

      // Strict validation: No credentials, secrets, or internal details exposed
      const serialized = JSON.stringify(formatted);
      expect(serialized).not.toContain('password');
      expect(serialized).not.toContain('secret');
      expect(serialized).not.toContain('postgres');
      expect(serialized).not.toContain('DATABASE_URL');
      expect(serialized).not.toContain('token');
    });

    it('produces the exact required JSON schema when database is unreachable', () => {
      const mockResult: KeepaliveResult = {
        success: false,
        database: 'unreachable',
        latencyMs: 5002,
        timestamp: '2026-10-04T01:10:00.000Z',
        errorCategory: 'DATABASE_TIMEOUT',
        errorMessage: 'Connection pooler timeout on port 6543',
      };

      const formatted = formatHealthResponse(mockResult, false);

      expect(formatted).toEqual({
        status: 'error',
        database: 'unreachable',
        timestamp: '2026-10-04T01:10:00.000Z',
      });
    });

    it('includes telemetry and latency only for authorized scheduler invocations', () => {
      const mockResult: KeepaliveResult = {
        success: true,
        database: 'reachable',
        latencyMs: 18,
        timestamp: '2026-10-04T01:10:00.000Z',
        restApiReachable: true,
      };

      const formatted = formatHealthResponse(mockResult, true) as any;

      expect(formatted.status).toBe('ok');
      expect(formatted.database).toBe('reachable');
      expect(formatted.latencyMs).toBe(18);
      expect(formatted.scheduler).toBe('authorized');
      expect(formatted.telemetry).toBeDefined();
      expect(formatted.telemetry.consecutiveFailures).toBe(0);
    });
  });

  describe('2. Scheduler Cron Authorization Verification', () => {
    const originalSecret = process.env.CRON_SECRET;

    beforeEach(() => {
      process.env.CRON_SECRET = 'test_cron_secret_high_entropy_32_chars';
    });

    afterEach(() => {
      process.env.CRON_SECRET = originalSecret;
    });

    it('authorizes requests with valid Authorization Bearer header', () => {
      const req = new NextRequest('http://localhost:3000/api/cron/keepalive', {
        headers: {
          authorization: 'Bearer test_cron_secret_high_entropy_32_chars',
        },
      });

      expect(verifyCronAuthorization(req)).toBe(true);
    });

    it('authorizes requests with valid x-cron-secret header', () => {
      const req = new NextRequest('http://localhost:3000/api/cron/keepalive', {
        headers: {
          'x-cron-secret': 'test_cron_secret_high_entropy_32_chars',
        },
      });

      expect(verifyCronAuthorization(req)).toBe(true);
    });

    it('authorizes requests with valid ?secret query parameter', () => {
      const req = new NextRequest(
        'http://localhost:3000/api/cron/keepalive?secret=test_cron_secret_high_entropy_32_chars'
      );

      expect(verifyCronAuthorization(req)).toBe(true);
    });

    it('rejects requests with missing or invalid token when CRON_SECRET is set', () => {
      const reqNoAuth = new NextRequest('http://localhost:3000/api/cron/keepalive');
      expect(verifyCronAuthorization(reqNoAuth)).toBe(false);

      const reqWrongToken = new NextRequest('http://localhost:3000/api/cron/keepalive', {
        headers: {
          authorization: 'Bearer invalid_secret',
        },
      });
      expect(verifyCronAuthorization(reqWrongToken)).toBe(false);
    });
  });

  describe('3. Public and Cron API Route Handlers', () => {
    it('GET /api/health responds with status 200 or 503 and valid headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/health');
      const response = await healthGet(req);

      expect([200, 503]).toContain(response.status);
      expect(response.headers.get('Cache-Control')).toContain('no-store');

      const body = await response.json();
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('timestamp');
      expect(['ok', 'error']).toContain(body.status);
      expect(['reachable', 'unreachable']).toContain(body.database);
    });

    it('HEAD /api/health responds with empty body and identical status', async () => {
      const req = new NextRequest('http://localhost:3000/api/health');
      const response = await healthHead(req);

      expect([200, 503]).toContain(response.status);
      const text = await response.text();
      expect(text).toBe('');
    });

    it('GET /api/cron/keepalive enforces 401 when unauthenticated in protected mode', async () => {
      const prevSecret = process.env.CRON_SECRET;
      process.env.CRON_SECRET = 'enforce_protected_mode_secret';

      try {
        const req = new NextRequest('http://localhost:3000/api/cron/keepalive');
        const response = await cronGet(req);

        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.error).toContain('Unauthorized');
      } finally {
        process.env.CRON_SECRET = prevSecret;
      }
    });

    it('GET /api/cron/keepalive succeeds when valid Bearer token is provided', async () => {
      const prevSecret = process.env.CRON_SECRET;
      process.env.CRON_SECRET = 'valid_bearer_test_secret';

      try {
        const req = new NextRequest('http://localhost:3000/api/cron/keepalive', {
          headers: {
            authorization: 'Bearer valid_bearer_test_secret',
          },
        });
        const response = await cronGet(req);

        expect([200, 503]).toContain(response.status);
        const body = await response.json();
        expect(body.scheduler).toBe('authorized');
      } finally {
        process.env.CRON_SECRET = prevSecret;
      }
    });
  });

  describe('4. Safe Database Activity Execution', () => {
    it('executes keepalive check without throwing unhandled exceptions', async () => {
      const result = await performKeepaliveCheck({ triggerAlert: false });

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(['reachable', 'unreachable']).toContain(result.database);
      expect(typeof result.latencyMs).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
