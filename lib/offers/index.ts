import prisma from '@/lib/db';
import { OfferInput } from '@/lib/validations';
import { DiscountType } from '@prisma/client';

export interface ActiveOffer {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  badge: string | null;
  discountType: DiscountType;
  discountValue: number | null;
  productId: string | null;
  categoryId: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  priority: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    sellingPrice: number;
    compareAtPrice: number | null;
    images: { url: string }[];
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Returns currently active, non-expired promotional offers
 */
export async function getActiveOffers(): Promise<ActiveOffer[]> {
  try {
    const now = new Date();

    const offers = await prisma.offer.findMany({
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
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sellingPrice: true,
            compareAtPrice: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return offers.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      imageUrl: o.imageUrl,
      badge: o.badge,
      discountType: o.discountType,
      discountValue: o.discountValue ? Number(o.discountValue) : null,
      productId: o.productId,
      categoryId: o.categoryId,
      buttonText: o.buttonText,
      buttonUrl: o.buttonUrl,
      priority: o.priority,
      product: o.product
        ? {
            id: o.product.id,
            name: o.product.name,
            slug: o.product.slug,
            sellingPrice: Number(o.product.sellingPrice),
            compareAtPrice: o.product.compareAtPrice ? Number(o.product.compareAtPrice) : null,
            images: o.product.images,
          }
        : null,
      category: o.category,
    }));
  } catch (error) {
    console.error('Error fetching active offers:', error);
    return [];
  }
}

/**
 * Returns all offers for administrative dashboard
 */
export async function getAllOffersAdmin() {
  return await prisma.offer.findMany({
    include: {
      product: { select: { id: true, name: true, sku: true } },
      category: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
}

/**
 * Fetches an offer by ID
 */
export async function getOfferById(id: string) {
  return await prisma.offer.findUnique({
    where: { id },
    include: {
      product: true,
      category: true,
    },
  });
}

/**
 * Creates a new offer
 */
export async function createOffer(input: OfferInput) {
  return await prisma.offer.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      badge: input.badge?.trim() || null,
      discountType: input.discountType as DiscountType,
      discountValue: input.discountValue ?? null,
      productId: input.productId?.trim() || null,
      categoryId: input.categoryId?.trim() || null,
      buttonText: input.buttonText?.trim() || 'View Offer',
      buttonUrl: input.buttonUrl?.trim() || null,
      priority: input.priority ?? 0,
      startAt: input.startAt ? new Date(input.startAt) : null,
      endAt: input.endAt ? new Date(input.endAt) : null,
      isActive: input.isActive ?? true,
    },
  });
}

/**
 * Updates an existing offer
 */
export async function updateOffer(id: string, input: OfferInput) {
  return await prisma.offer.update({
    where: { id },
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      badge: input.badge?.trim() || null,
      discountType: input.discountType as DiscountType,
      discountValue: input.discountValue ?? null,
      productId: input.productId?.trim() || null,
      categoryId: input.categoryId?.trim() || null,
      buttonText: input.buttonText?.trim() || 'View Offer',
      buttonUrl: input.buttonUrl?.trim() || null,
      priority: input.priority ?? 0,
      startAt: input.startAt ? new Date(input.startAt) : null,
      endAt: input.endAt ? new Date(input.endAt) : null,
      isActive: input.isActive ?? true,
    },
  });
}

/**
 * Deletes an offer
 */
export async function deleteOffer(id: string) {
  return await prisma.offer.delete({
    where: { id },
  });
}

/**
 * Toggles offer active status
 */
export async function toggleOfferActive(id: string, isActive: boolean) {
  return await prisma.offer.update({
    where: { id },
    data: { isActive },
  });
}
