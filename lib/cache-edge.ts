/**
 * Trust Computer — Edge-Safe Caching Utility
 *
 * Cloudflare Workers runtime does not provide a local disk filesystem (no `fs.readdir`).
 * Standard Next.js `unstable_cache` fails on Workers with `[unenv] fs.readdir is not implemented yet!`.
 *
 * This module provides an in-memory TTL and tag-invalidatable cache with an identical signature
 * to Next.js `unstable_cache`, ensuring zero runtime errors on Cloudflare Workers edge.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

const memoryCache = new Map<string, CacheEntry<any>>();

export function edgeCache<T extends (...args: any[]) => Promise<any>>(
  cb: T,
  keyParts?: string[],
  options?: { revalidate?: number | false; tags?: string[] }
): T {
  const baseKey = keyParts ? keyParts.join(':') : (cb.name || 'anonymous');
  const ttlMs = typeof options?.revalidate === 'number' ? options.revalidate * 1000 : 300_000;
  const tags = options?.tags || [];

  return (async (...args: any[]) => {
    const key = `${baseKey}:${JSON.stringify(args)}`;
    const now = Date.now();
    const entry = memoryCache.get(key);

    if (entry && entry.expiresAt > now) {
      return entry.data;
    }

    const data = await cb(...args);
    memoryCache.set(key, {
      data,
      expiresAt: now + ttlMs,
      tags,
    });
    return data;
  }) as T;
}

export function revalidateEdgeTag(tag: string) {
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.tags.includes(tag)) {
      memoryCache.delete(key);
    }
  }
}
