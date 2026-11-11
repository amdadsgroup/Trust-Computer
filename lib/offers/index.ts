import prisma from '@/lib/db';
import { OfferInput } from '@/lib/validations';
import { DiscountType } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { edgeCache, revalidateEdgeTag } from '@/lib/cache-edge';
import { createAdminClient } from '@/lib/supabase/admin';

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

function mapOfferToActive(o: any): ActiveOffer {
  return {
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
          images: Array.isArray(o.product.images) ? o.product.images : [],
        }
      : null,
    category: o.category || null,
  };
}

function clearOfferCaches() {
  try {
    revalidateTag('offers');
    revalidateTag('homepage');
  } catch {}
  revalidateEdgeTag('offers');
  revalidateEdgeTag('homepage');
}

/**
 * Returns currently active, non-expired promotional offers
 */
export const getActiveOffers = edgeCache(
  async (): Promise<ActiveOffer[]> => {
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

      return offers.map(mapOfferToActive);
    } catch {
      const sb = createAdminClient();
      if (sb) {
        try {
          const nowMs = Date.now();
          const { data } = await sb
            .from('offers')
            .select(
              '*, product:products(id, name, slug, sellingPrice, compareAtPrice, images:product_images(url, isPrimary)), category:categories(id, name, slug)'
            )
            .eq('isActive', true)
            .order('priority', { ascending: false })
            .order('createdAt', { ascending: false });

          return (data || [])
            .filter((o: any) => {
              if (o.startAt && new Date(o.startAt).getTime() > nowMs) return false;
              if (o.endAt && new Date(o.endAt).getTime() < nowMs) return false;
              return true;
            })
            .map(mapOfferToActive);
        } catch {}
      }
      return [];
    }
  },
  ['active-offers'],
  { revalidate: 300, tags: ['offers'] }
);

/**
 * Returns all offers for administrative dashboard
 */
export async function getAllOffersAdmin() {
  try {
    return await prisma.offer.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('offers')
      .select('*, product:products(id, name, sku), category:categories(id, name)')
      .order('priority', { ascending: false })
      .order('createdAt', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
}

/**
 * Fetches an offer by ID
 */
export async function getOfferById(id: string) {
  try {
    return await prisma.offer.findUnique({
      where: { id },
      include: {
        product: true,
        category: true,
      },
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('offers')
      .select('*, product:products(*), category:categories(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
}

async function resolveOfferRelations(productId?: string | null, categoryId?: string | null) {
  let validProductId: string | null = null;
  if (productId?.trim()) {
    const cleanProdId = productId.trim();
    try {
      const prod = await prisma.product.findUnique({
        where: { id: cleanProdId },
        select: { id: true },
      });
      if (prod) validProductId = prod.id;
    } catch {
      const sb = createAdminClient();
      if (sb) {
        const { data: prod } = await sb.from('products').select('id').eq('id', cleanProdId).maybeSingle();
        if (prod) validProductId = prod.id;
      }
    }
  }

  let validCategoryId: string | null = null;
  if (categoryId?.trim()) {
    const cleanCatId = categoryId.trim();
    try {
      const cat = await prisma.category.findUnique({
        where: { id: cleanCatId },
        select: { id: true },
      });
      if (cat) validCategoryId = cat.id;
    } catch {
      const sb = createAdminClient();
      if (sb) {
        const { data: cat } = await sb.from('categories').select('id').eq('id', cleanCatId).maybeSingle();
        if (cat) validCategoryId = cat.id;
      }
    }
  }

  return { validProductId, validCategoryId };
}

function buildOfferFields(
  input: OfferInput,
  validProductId: string | null,
  validCategoryId: string | null,
  forSupabase = false
) {
  const startAt = input.startAt ? new Date(input.startAt) : null;
  const endAt = input.endAt ? new Date(input.endAt) : null;
  return {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    badge: input.badge?.trim() || null,
    discountType: input.discountType as DiscountType,
    discountValue: input.discountValue ?? null,
    productId: validProductId,
    categoryId: validCategoryId,
    buttonText: input.buttonText?.trim() || 'View Offer',
    buttonUrl: input.buttonUrl?.trim() || null,
    priority: input.priority ?? 0,
    startAt: forSupabase ? (startAt ? startAt.toISOString() : null) : startAt,
    endAt: forSupabase ? (endAt ? endAt.toISOString() : null) : endAt,
    isActive: input.isActive ?? true,
  };
}

/**
 * Creates a new offer
 */
export async function createOffer(input: OfferInput) {
  const { validProductId, validCategoryId } = await resolveOfferRelations(input.productId, input.categoryId);

  let offer: any;
  try {
    offer = await prisma.offer.create({
      data: buildOfferFields(input, validProductId, validCategoryId, false) as any,
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from('offers')
      .insert({
        id: crypto.randomUUID(),
        ...buildOfferFields(input, validProductId, validCategoryId, true),
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to create offer');
    offer = data;
  }

  clearOfferCaches();
  return offer;
}

/**
 * Updates an existing offer
 */
export async function updateOffer(id: string, input: OfferInput) {
  const { validProductId, validCategoryId } = await resolveOfferRelations(input.productId, input.categoryId);

  let offer: any;
  try {
    offer = await prisma.offer.update({
      where: { id },
      data: buildOfferFields(input, validProductId, validCategoryId, false) as any,
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('offers')
      .update({
        ...buildOfferFields(input, validProductId, validCategoryId, true),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to update offer');
    offer = data;
  }

  clearOfferCaches();
  return offer;
}

/**
 * Deletes an offer
 */
export async function deleteOffer(id: string) {
  let result: any;
  try {
    result = await prisma.offer.delete({ where: { id } });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { error } = await sb.from('offers').delete().eq('id', id);
    if (error) throw new Error(error.message);
    result = { id };
  }
  clearOfferCaches();
  return result;
}

/**
 * Toggles offer active status
 */
export async function toggleOfferActive(id: string, isActive: boolean) {
  let result: any;
  try {
    result = await prisma.offer.update({
      where: { id },
      data: { isActive },
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('offers')
      .update({ isActive, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || 'Failed to update offer');
    result = data;
  }
  clearOfferCaches();
  return result;
}
