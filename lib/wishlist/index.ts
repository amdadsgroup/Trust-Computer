/**
 * Trust Computer — Wishlist Service
 * Handles wishlist operations for authenticated customers.
 * For guests, the wishlist is stored in localStorage (handled client-side).
 */

import prisma from '@/lib/db';

export async function getOrCreateWishlist(customerId: string) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              category: true,
              brand: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                category: true,
                brand: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });
  }

  return wishlist;
}

export async function addToWishlist(customerId: string, productId: string) {
  const wishlist = await getOrCreateWishlist(customerId);

  try {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });
    return { success: true };
  } catch (error: any) {
    // Unique constraint violation — already in wishlist
    if (error?.code === 'P2002') {
      return { success: true, alreadyExists: true };
    }
    throw error;
  }
}

export async function removeFromWishlist(customerId: string, productId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
  });

  if (!wishlist) return { success: false, reason: 'Wishlist not found' };

  await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  return { success: true };
}

export async function isInWishlist(customerId: string, productId: string): Promise<boolean> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
    select: { id: true },
  });

  if (!wishlist) return false;

  const item = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  return !!item;
}

export async function getWishlistItemCount(customerId: string): Promise<number> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
    select: { _count: { select: { items: true } } },
  });

  return wishlist?._count?.items ?? 0;
}

export async function moveWishlistItemToCart(customerId: string, productId: string) {
  // Remove from wishlist — cart add is handled by CartContext client-side
  return removeFromWishlist(customerId, productId);
}
