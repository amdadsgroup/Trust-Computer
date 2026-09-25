/**
 * Trust Computer — Reviews Service
 * Handles server-side review operations with moderation support.
 */

import prisma from '@/lib/db';
import { ReviewStatus } from '@prisma/client';

export interface CreateReviewInput {
  productId: string;
  customerId?: string;
  reviewerName: string;
  rating: number; // 1-5
  title?: string;
  body: string;
  isVerifiedPurchase?: boolean;
}

export interface ReviewListOptions {
  productId: string;
  status?: ReviewStatus;
  limit?: number;
  offset?: number;
}

/**
 * Submit a new review. All reviews start as PENDING for moderation.
 */
export async function createReview(input: CreateReviewInput) {
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }

  if (!input.body.trim() || input.body.trim().length < 10) {
    throw new Error('Review body must be at least 10 characters.');
  }

  // Prevent duplicate reviews from the same customer for the same product
  if (input.customerId) {
    const existing = await prisma.review.findFirst({
      where: {
        productId: input.productId,
        customerId: input.customerId,
        status: { not: ReviewStatus.REJECTED },
      },
    });

    if (existing) {
      throw new Error('You have already submitted a review for this product.');
    }
  }

  const review = await prisma.review.create({
    data: {
      productId: input.productId,
      customerId: input.customerId ?? null,
      reviewerName: input.reviewerName.trim(),
      rating: input.rating,
      title: input.title?.trim() || null,
      body: input.body.trim(),
      isVerifiedPurchase: input.isVerifiedPurchase ?? false,
      status: ReviewStatus.PENDING,
    },
  });

  return review;
}

/**
 * Get approved reviews for a product (public-facing).
 */
export async function getProductReviews(options: ReviewListOptions) {
  const { productId, status = ReviewStatus.APPROVED, limit = 10, offset = 0 } = options;

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status },
      include: {
        images: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.review.count({ where: { productId, status } }),
  ]);

  return { reviews, totalCount };
}

/**
 * Get aggregate review stats for a product.
 */
export async function getProductReviewStats(productId: string) {
  const stats = await prisma.review.aggregate({
    where: { productId, status: ReviewStatus.APPROVED },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const breakdown = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId, status: ReviewStatus.APPROVED },
    _count: { rating: true },
  });

  return {
    averageRating: stats._avg.rating ?? 0,
    totalReviews: stats._count.rating,
    breakdown: breakdown.map((b) => ({ rating: b.rating, count: b._count.rating })),
  };
}

/**
 * Admin: Moderate a review (approve/reject/flag).
 */
export async function moderateReview(
  reviewId: string,
  action: 'APPROVED' | 'REJECTED' | 'REPORTED',
  moderatorNote?: string
) {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      status: action as ReviewStatus,
      moderatorNote: moderatorNote ?? null,
    },
  });
}

/**
 * Check if a customer has purchased a product (for verified purchase badge).
 */
export async function hasCustomerPurchasedProduct(
  customerId: string,
  productId: string
): Promise<boolean> {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        customerId,
        status: { in: ['DELIVERED'] },
      },
    },
  });

  return !!orderItem;
}
