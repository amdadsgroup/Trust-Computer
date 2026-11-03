import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://trustcomputermb.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/api/*',
          '/admin/',
          '/admin/*',
          '/account/',
          '/account/*',
          '/order-confirmation/',
          '/order-confirmation/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/wishlist',
        ],
      },
      {
        userAgent: [
          'Bytespider',
          'MJ12bot',
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'DataForSeoBot',
          'Amazonbot',
          'PetalBot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
