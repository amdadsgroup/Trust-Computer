import prisma from '@/lib/db';
import { BannerInput } from '@/lib/validations';
import { BannerType } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { edgeCache, revalidateEdgeTag } from '@/lib/cache-edge';
import { createAdminClient } from '@/lib/supabase/admin';

export interface ActiveBanner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  desktopImageUrl: string;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  type: BannerType;
  priority: number;
}

function buildBannerFields(input: BannerInput, forSupabase = false) {
  const startAt = input.startAt ? new Date(input.startAt) : null;
  const endAt = input.endAt ? new Date(input.endAt) : null;
  return {
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    description: input.description?.trim() || null,
    desktopImageUrl: input.desktopImageUrl.trim(),
    mobileImageUrl: input.mobileImageUrl?.trim() || null,
    buttonText: input.buttonText?.trim() || 'Shop Now',
    buttonUrl: input.buttonUrl?.trim() || null,
    type: input.type as BannerType,
    priority: input.priority ?? 0,
    startAt: forSupabase ? (startAt ? startAt.toISOString() : null) : startAt,
    endAt: forSupabase ? (endAt ? endAt.toISOString() : null) : endAt,
    isActive: input.isActive ?? true,
  };
}

function clearBannerCaches() {
  try {
    revalidateTag('banners');
    revalidateTag('homepage');
  } catch {}
  revalidateEdgeTag('banners');
  revalidateEdgeTag('homepage');
}

/**
 * Returns currently active, non-expired banners ordered by priority
 */
export const getActiveBanners = edgeCache(
  async (): Promise<ActiveBanner[]> => {
    try {
      const now = new Date();

      const banners = await prisma.banner.findMany({
        where: {
          isActive: true,
          AND: [
            {
              OR: [{ startAt: null }, { startAt: { lte: now } }],
            },
            {
              OR: [{ endAt: null }, { endAt: { gte: now } }],
            },
          ],
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });

      return banners;
    } catch {
      const sb = createAdminClient();
      if (sb) {
        try {
          const nowMs = Date.now();
          const { data } = await sb
            .from('banners')
            .select('*')
            .eq('isActive', true)
            .order('priority', { ascending: false })
            .order('createdAt', { ascending: false });

          return (data || []).filter((b: any) => {
            if (b.startAt && new Date(b.startAt).getTime() > nowMs) return false;
            if (b.endAt && new Date(b.endAt).getTime() < nowMs) return false;
            return true;
          });
        } catch {}
      }
      return [];
    }
  },
  ['active-banners'],
  { revalidate: 300, tags: ['banners'] }
);

/**
 * Returns all banners for administrative management
 */
export async function getAllBannersAdmin() {
  try {
    return await prisma.banner.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('banners')
      .select('*')
      .order('priority', { ascending: false })
      .order('createdAt', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
}

/**
 * Fetches a single banner by ID
 */
export async function getBannerById(id: string) {
  try {
    return await prisma.banner.findUnique({ where: { id } });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb.from('banners').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
}

/**
 * Creates a new banner
 */
export async function createBanner(input: BannerInput) {
  let banner: any;
  try {
    banner = await prisma.banner.create({
      data: buildBannerFields(input, false) as any,
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from('banners')
      .insert({
        id: crypto.randomUUID(),
        ...buildBannerFields(input, true),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create banner');
    banner = data;
  }
  clearBannerCaches();
  return banner;
}

/**
 * Updates an existing banner
 */
export async function updateBanner(id: string, input: BannerInput) {
  let banner: any;
  try {
    banner = await prisma.banner.update({
      where: { id },
      data: buildBannerFields(input, false) as any,
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('banners')
      .update({
        ...buildBannerFields(input, true),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to update banner');
    banner = data;
  }
  clearBannerCaches();
  return banner;
}

/**
 * Deletes a banner
 */
export async function deleteBanner(id: string) {
  let result: any;
  try {
    result = await prisma.banner.delete({ where: { id } });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { error } = await sb.from('banners').delete().eq('id', id);
    if (error) throw new Error(error.message);
    result = { id };
  }
  clearBannerCaches();
  return result;
}

/**
 * Toggles banner active status
 */
export async function toggleBannerActive(id: string, isActive: boolean) {
  let result: any;
  try {
    result = await prisma.banner.update({
      where: { id },
      data: { isActive },
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('banners')
      .update({ isActive, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to update banner');
    result = data;
  }
  clearBannerCaches();
  return result;
}

/**
 * Reorders banners by setting their priority values
 */
export async function reorderBanners(bannerIds: string[]) {
  try {
    const updates = bannerIds.map((id, index) => {
      const priority = (bannerIds.length - index) * 10;
      return prisma.banner.update({
        where: { id },
        data: { priority },
      });
    });

    const result = await prisma.$transaction(updates);
    clearBannerCaches();
    return result;
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const now = new Date().toISOString();
    await Promise.all(
      bannerIds.map((id, index) =>
        sb
          .from('banners')
          .update({ priority: (bannerIds.length - index) * 10, updatedAt: now })
          .eq('id', id)
      )
    );
    clearBannerCaches();
    return [];
  }
}
