import { MetadataRoute } from 'next';
import prisma from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 86400; // Cache sitemap at Vercel Edge for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://trustcomputermb.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/moulvibazar`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/policies/delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/policies/warranty`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/policies/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  try {
    let products: Array<{ slug: string; updatedAt: Date | string }> = [];
    let categories: Array<{ slug: string; updatedAt: Date | string }> = [];

    try {
      const [dbProducts, dbCategories] = await Promise.all([
        prisma.product.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
        }),
      ]);
      products = dbProducts;
      categories = dbCategories;
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;
      const [prodsRes, catsRes] = await Promise.all([
        sb.from('products').select('slug, updatedAt').eq('isActive', true),
        sb.from('categories').select('slug, updatedAt').eq('isActive', true),
      ]);
      products = prodsRes.data || [];
      categories = catsRes.data || [];
    }

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${baseUrl}/categories/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...categoryUrls, ...productUrls];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticPages;
  }
}
