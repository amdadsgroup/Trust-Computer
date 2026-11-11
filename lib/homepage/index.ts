import prisma from '@/lib/db';
import { revalidateTag } from 'next/cache';
import { edgeCache, revalidateEdgeTag } from '@/lib/cache-edge';
import { createAdminClient } from '@/lib/supabase/admin';

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

function getDefaultSections(): HomepageSectionConfig[] {
  return DEFAULT_SECTIONS.map((s, index) => ({
    id: `default-${index}`,
    ...s,
  }));
}

export const getHomepageSections = edgeCache(
  async (): Promise<HomepageSectionConfig[]> => {
    try {
      const existing = await prisma.homepageSection.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      if (existing.length > 0) {
        return existing;
      }

      return getDefaultSections();
    } catch {
      const sb = createAdminClient();
      if (sb) {
        try {
          const { data } = await sb
            .from('homepage_sections')
            .select('*')
            .order('sortOrder', { ascending: true });
          if (data && data.length > 0) {
            return data;
          }
        } catch {}
      }
      return getDefaultSections();
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
  let result: any;
  try {
    result = await prisma.homepageSection.upsert({
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
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const now = new Date().toISOString();
    const { data: existing } = await sb
      .from('homepage_sections')
      .select('id')
      .eq('sectionKey', sectionKey)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await sb
        .from('homepage_sections')
        .update({ ...data, updatedAt: now })
        .eq('sectionKey', sectionKey)
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = updated;
    } else {
      const { data: created, error } = await sb
        .from('homepage_sections')
        .insert({
          id: crypto.randomUUID(),
          sectionKey,
          title: data.title || sectionKey,
          subtitle: data.subtitle || null,
          sortOrder: data.sortOrder ?? 0,
          isVisible: data.isVisible ?? true,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = created;
    }
  }

  try {
    revalidateTag('homepage-sections');
  } catch {}
  revalidateEdgeTag('homepage-sections');
  return result;
}

/**
 * Reorders sections by array of keys in order
 */
export async function reorderHomepageSections(sectionKeys: string[]) {
  try {
    const operations = sectionKeys.map((sectionKey, index) =>
      prisma.homepageSection.update({
        where: { sectionKey },
        data: { sortOrder: (index + 1) * 10 },
      })
    );
    const res = await prisma.$transaction(operations);
    revalidateEdgeTag('homepage-sections');
    return res;
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const now = new Date().toISOString();
    await Promise.all(
      sectionKeys.map((sectionKey, index) =>
        sb
          .from('homepage_sections')
          .update({ sortOrder: (index + 1) * 10, updatedAt: now })
          .eq('sectionKey', sectionKey)
      )
    );
    revalidateEdgeTag('homepage-sections');
    return [];
  }
}
