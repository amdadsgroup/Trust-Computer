import prisma from '@/lib/db';
import { BannerInput } from '@/lib/validations';
import { BannerType } from '@prisma/client';

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

/**
 * Returns currently active, non-expired banners ordered by priority
 */
export async function getActiveBanners(): Promise<ActiveBanner[]> {
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
  } catch (error) {
    console.error('Error fetching active banners from database:', error);
    return [];
  }
}

/**
 * Returns all banners for administrative management
 */
export async function getAllBannersAdmin() {
  return await prisma.banner.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
}

/**
 * Fetches a single banner by ID
 */
export async function getBannerById(id: string) {
  return await prisma.banner.findUnique({
    where: { id },
  });
}

/**
 * Creates a new banner
 */
export async function createBanner(input: BannerInput) {
  return await prisma.banner.create({
    data: {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      description: input.description?.trim() || null,
      desktopImageUrl: input.desktopImageUrl.trim(),
      mobileImageUrl: input.mobileImageUrl?.trim() || null,
      buttonText: input.buttonText?.trim() || 'Shop Now',
      buttonUrl: input.buttonUrl?.trim() || null,
      type: input.type as BannerType,
      priority: input.priority ?? 0,
      startAt: input.startAt ? new Date(input.startAt) : null,
      endAt: input.endAt ? new Date(input.endAt) : null,
      isActive: input.isActive ?? true,
    },
  });
}

/**
 * Updates an existing banner
 */
export async function updateBanner(id: string, input: BannerInput) {
  return await prisma.banner.update({
    where: { id },
    data: {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      description: input.description?.trim() || null,
      desktopImageUrl: input.desktopImageUrl.trim(),
      mobileImageUrl: input.mobileImageUrl?.trim() || null,
      buttonText: input.buttonText?.trim() || 'Shop Now',
      buttonUrl: input.buttonUrl?.trim() || null,
      type: input.type as BannerType,
      priority: input.priority ?? 0,
      startAt: input.startAt ? new Date(input.startAt) : null,
      endAt: input.endAt ? new Date(input.endAt) : null,
      isActive: input.isActive ?? true,
    },
  });
}

/**
 * Deletes a banner
 */
export async function deleteBanner(id: string) {
  return await prisma.banner.delete({
    where: { id },
  });
}

/**
 * Toggles banner active status
 */
export async function toggleBannerActive(id: string, isActive: boolean) {
  return await prisma.banner.update({
    where: { id },
    data: { isActive },
  });
}

/**
 * Reorders banners by setting their priority values
 */
export async function reorderBanners(bannerIds: string[]) {
  const updates = bannerIds.map((id, index) => {
    // Higher priority first
    const priority = (bannerIds.length - index) * 10;
    return prisma.banner.update({
      where: { id },
      data: { priority },
    });
  });

  return await prisma.$transaction(updates);
}
