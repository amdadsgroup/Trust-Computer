import { NextResponse, type NextRequest } from 'next/server';

// Known exploit and scanning patterns
const EXPLOIT_PATTERNS = [
  /\.(php|env|git|sql|bak|asp|jsp|cgi|action|do)(\/|$)/i,
  /\b(wp-login|wp-admin|wp-content|wp-includes|xmlrpc|phpmyadmin|pma|cgi-bin|autodiscover|setup\.php|install\.php|solr)\b/i,
  /\/\.well-known\/(?!acme-challenge)/i,
];

// Aggressive commercial scrapers that waste serverless compute and ignore crawl delays
// Note: Legitimate search engines (Googlebot, Bingbot, DuckDuckBot, Yahoo, Applebot) are EXCLUDED and permitted.
const BLOCKED_BOT_PATTERNS = [
  /bytespider/i,
  /mj12bot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /dotbot/i,
  /dataforseobot/i,
  /amazonbot/i,
  /petalbot/i,
  /seekport/i,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Immediately drop vulnerability scans and exploit probes at the Edge
  // Returns immediate 404 without invoking Serverless functions, layouts, or database
  for (const pattern of EXPLOIT_PATTERNS) {
    if (pattern.test(pathname)) {
      return new Response('Resource Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // 2. Block aggressive scrapers that abuse serverless rendering quotas
  if (userAgent) {
    for (const botPattern of BLOCKED_BOT_PATTERNS) {
      if (botPattern.test(userAgent)) {
        return new Response('Access restricted for automated scrapers.', {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
  }

  // 3. Forward request with standard security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - brand, images, products (public asset directories)
     * - favicon, icons, manifests, sitemap, robots
     */
    '/((?!_next/static|_next/image|brand/|images/|products/|favicon.png|apple-touch-icon.png|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
};

