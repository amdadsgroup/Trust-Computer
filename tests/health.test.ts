import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthGet, HEAD as healthHead } from '../app/api/health/route';
import { prisma } from '../lib/db';

vi.mock('../lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe('Health Check Endpoint (/api/health)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns status 200 ok when database is reachable', async () => {
    (prisma.$queryRaw as any).mockResolvedValueOnce([{ alive: 1 }]);

    const req = new NextRequest('http://localhost:3000/api/health');
    const response = await healthGet(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.database).toBe('reachable');
    expect(data.timestamp).toBeDefined();
  });

  it('returns status 503 error when database is unreachable', async () => {
    (prisma.$queryRaw as any).mockRejectedValueOnce(new Error('Connection refused'));

    const req = new NextRequest('http://localhost:3000/api/health');
    const response = await healthGet(req);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.database).toBe('unreachable');
    expect(data.timestamp).toBeDefined();
  });

  it('handles HEAD requests with matching status and headers', async () => {
    (prisma.$queryRaw as any).mockResolvedValueOnce([{ alive: 1 }]);

    const req = new NextRequest('http://localhost:3000/api/health', { method: 'HEAD' });
    const response = await healthHead(req);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
