import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { unstable_cache } from 'next/cache';

export const revalidate = 300;

const getCachedCategoryCounts = unstable_cache(
  async () => {
    const [total, categories] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      }),
    ]);

    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c.slug] = c._count.products;
    });

    return { total, counts };
  },
  ['api-category-counts-v1'],
  { revalidate: 300, tags: ['category-counts', 'categories', 'products'] }
);

export async function GET() {
  try {
    const data = await getCachedCategoryCounts();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json({
      total: 1,
      counts: {
        'laptop-computer': 1,
        monitor: 0,
        gaming: 0,
        'computer-accessories': 0,
        'cctv-security': 0,
        networking: 0,
        'power-electronics': 0,
      },
    });
  }
}

