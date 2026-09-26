import prisma from '@/lib/db';

export interface HomepageSectionConfig {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  sortOrder: number;
  isVisible: boolean;
}

const DEFAULT_SECTIONS = [
  { sectionKey: 'HERO_BANNER', title: 'Hero Banner Carousel', subtitle: 'Promotional Banners & Deals', sortOrder: 1, isVisible: true },
  { sectionKey: 'FEATURED_OFFERS', title: 'Special Offers & Promotions', subtitle: 'Exclusive Limited Time Deals', sortOrder: 2, isVisible: true },
  { sectionKey: 'FEATURED_CATEGORIES', title: 'Featured Categories', subtitle: 'Explore Popular Tech Categories', sortOrder: 3, isVisible: true },
  { sectionKey: 'FEATURED_PRODUCTS', title: 'Featured Products', subtitle: 'Check & Get Your Desired Product from Trust Computer Moulvibazar', sortOrder: 4, isVisible: true },
  { sectionKey: 'NEW_ARRIVALS', title: 'New Arrivals', subtitle: 'Latest Computer Components and Tech Gadgets', sortOrder: 5, isVisible: true },
  { sectionKey: 'SHOWROOM_INFO', title: 'Showroom & Verified Trust', subtitle: 'Visit Our Physical Outlet in Kusumbagh, Moulvibazar', sortOrder: 6, isVisible: true },
];

import { unstable_cache, revalidateTag } from 'next/cache';

export const getHomepageSections = unstable_cache(
  async (): Promise<HomepageSectionConfig[]> => {
    try {
      const existing = await prisma.homepageSection.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      if (existing.length > 0) {
        return existing;
      }

      // Return default sections directly to avoid build-time race condition
      return DEFAULT_SECTIONS.map((s, index) => ({
        id: `default-${index}`,
        ...s,
      }));
    } catch (error) {
      console.error('Error fetching homepage sections:', error);
      return DEFAULT_SECTIONS.map((s, index) => ({
        id: `default-${index}`,
        ...s,
      }));
    }
  },
  ['homepage-sections'],
  { revalidate: 300, tags: ['homepage-sections'] }
);

/**
 * Updates a specific section's visibility and title
 */
export async function updateHomepageSection(
  sectionKey: string,
  data: { isVisible?: boolean; sortOrder?: number; title?: string; subtitle?: string }
) {
  const result = await prisma.homepageSection.upsert({
    where: { sectionKey },
    update: data,
    create: {
      sectionKey,
      title: data.title || sectionKey,
      subtitle: data.subtitle || null,
      sortOrder: data.sortOrder ?? 0,
      isVisible: data.isVisible ?? true,
    },
  });
  try {
    revalidateTag('homepage-sections');
  } catch {}
  return result;
}

/**
 * Reorders sections by array of keys in order
 */
export async function reorderHomepageSections(sectionKeys: string[]) {
  const operations = sectionKeys.map((sectionKey, index) =>
    prisma.homepageSection.update({
      where: { sectionKey },
      data: { sortOrder: (index + 1) * 10 },
    })
  );

  return await prisma.$transaction(operations);
}
