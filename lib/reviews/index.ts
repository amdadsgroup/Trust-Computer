/**
 * Trust Computer — Reviews Service
 * Handles server-side review operations, verified purchase checks, aggregation, and moderation.
 */

import prisma from '@/lib/db';
import { ReviewStatus } from '@prisma/client';

export interface CreateReviewInput {
  productId: string;
  customerId?: string;
  reviewerName: string;
  reviewerEmail?: string;
  reviewerPhone?: string;
  rating: number; // 1-5
  title?: string;
  body: string;
  imageUrls?: string[];
  isVerifiedPurchase?: boolean;
  status?: ReviewStatus;
}

export interface ReviewListOptions {
  productId: string;
  rating?: number;
  isVerifiedOnly?: boolean;
  status?: ReviewStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'highest' | 'lowest';
}

export interface AdminReviewListOptions {
  status?: ReviewStatus | 'ALL';
  search?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Check if a customer or guest phone/email has purchased the product with a DELIVERED order.
 */
export async function checkVerifiedPurchase(params: {
  productId: string;
  customerId?: string | null;
  email?: string | null;
  phone?: string | null;
}): Promise<boolean> {
  const { productId, customerId, email, phone } = params;

  // 1. By customer profile ID
  if (customerId) {
    const customerOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          customerId,
          status: 'DELIVERED',
        },
      },
      select: { id: true },
    });
    if (customerOrder) return true;
  }

  // 2. By customer email or phone in orders
  const orConditions: Array<{ customerPhone?: string; customerEmail?: string }> = [];
  if (phone && phone.trim()) {
    orConditions.push({ customerPhone: phone.trim() });
  }
  if (email && email.trim()) {
    orConditions.push({ customerEmail: email.trim() });
  }

  if (orConditions.length > 0) {
    const guestOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          status: 'DELIVERED',
          OR: orConditions,
        },
      },
      select: { id: true },
    });
    if (guestOrder) return true;
  }

  return false;
}

/**
 * Check if an authenticated customer has purchased a product.
 */
export async function hasCustomerPurchasedProduct(
  customerId: string,
  productId: string
): Promise<boolean> {
  return checkVerifiedPurchase({ customerId, productId });
}

/**
 * Submit a new review.
 * Auto-verifies purchases and defaults to APPROVED for immediate user feedback.
 */
export async function createReview(input: CreateReviewInput) {
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5 stars.');
  }

  if (!input.reviewerName || !input.reviewerName.trim()) {
    throw new Error('Your name is required.');
  }

  if (!input.body.trim() || input.body.trim().length < 5) {
    throw new Error('Review content must be at least 5 characters.');
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true, name: true },
  });
  if (!product) {
    throw new Error('Product not found.');
  }

  // Safely resolve customerId if provided
  let validCustomerId: string | null = null;
  if (input.customerId) {
    const customer = await prisma.customerProfile.findUnique({
      where: { id: input.customerId },
      select: { id: true },
    });
    if (customer) {
      validCustomerId = customer.id;
    }
  }

  // Prevent duplicate reviews from the same logged-in customer for the same product
  if (validCustomerId) {
    const existing = await prisma.review.findFirst({
      where: {
        productId: input.productId,
        customerId: validCustomerId,
        status: { not: ReviewStatus.REJECTED },
      },
    });

    if (existing) {
      throw new Error('You have already submitted a review for this product.');
    }
  }

  // Check verified purchase status
  const isVerified =
    input.isVerifiedPurchase ||
    (await checkVerifiedPurchase({
      productId: input.productId,
      customerId: validCustomerId,
      email: input.reviewerEmail,
      phone: input.reviewerPhone,
    }));

  // Create review in database
  const review = await prisma.review.create({
    data: {
      productId: input.productId,
      customerId: validCustomerId,
      reviewerName: input.reviewerName.trim(),
      rating: Math.round(input.rating),
      title: input.title?.trim() || null,
      body: input.body.trim(),
      isVerifiedPurchase: isVerified,
      status: input.status ?? ReviewStatus.APPROVED,
      images:
        input.imageUrls && input.imageUrls.length > 0
          ? {
              create: input.imageUrls.map((url) => ({
                url: url.trim(),
              })),
            }
          : undefined,
    },
    include: {
      images: true,
      customer: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return review;
}

/**
 * Get approved reviews for a product with filtering, sorting, and pagination.
 */
export async function getProductReviews(options: ReviewListOptions) {
  const {
    productId,
    rating,
    isVerifiedOnly = false,
    status = ReviewStatus.APPROVED,
    limit = 10,
    offset = 0,
    sortBy = 'newest',
  } = options;

  const whereClause: any = {
    productId,
    status,
  };

  if (rating && rating >= 1 && rating <= 5) {
    whereClause.rating = rating;
  }

  if (isVerifiedOnly) {
    whereClause.isVerifiedPurchase = true;
  }

  let orderBy: any = [{ createdAt: 'desc' }];
  if (sortBy === 'highest') {
    orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
  } else if (sortBy === 'lowest') {
    orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
  }

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: whereClause,
      include: {
        images: true,
        customer: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.review.count({ where: whereClause }),
  ]);

  return { reviews, totalCount, limit, offset };
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

  const breakdownCounts = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId, status: ReviewStatus.APPROVED },
    _count: { rating: true },
  });

  const totalReviews = stats._count.rating || 0;
  const averageRating = Number((stats._avg.rating ?? 0).toFixed(1));

  // Build 1-5 breakdown with counts and percentages
  const breakdown: Record<number, { count: number; percentage: number }> = {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };

  let positiveCount = 0; // 4 and 5 stars
  for (const b of breakdownCounts) {
    const star = b.rating;
    const count = b._count.rating;
    if (breakdown[star]) {
      breakdown[star].count = count;
      breakdown[star].percentage =
        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    }
    if (star >= 4) {
      positiveCount += count;
    }
  }

  const recommendedPercentage =
    totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 100;

  return {
    averageRating,
    totalReviews,
    recommendedPercentage,
    breakdown,
  };
}

/**
 * Admin: Get reviews with search, filtering, and stats.
 */
export async function getAdminReviews(options: AdminReviewListOptions = {}) {
  const {
    status = 'ALL',
    search = '',
    rating,
    page = 1,
    pageSize = 15,
  } = options;

  const whereClause: any = {};

  if (status !== 'ALL') {
    whereClause.status = status;
  }

  if (rating && rating >= 1 && rating <= 5) {
    whereClause.rating = rating;
  }

  if (search && search.trim()) {
    const q = search.trim();
    whereClause.OR = [
      { reviewerName: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { body: { contains: q, mode: 'insensitive' } },
      { product: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [reviews, totalCount, allCount, pendingCount, approvedCount, rejectedCount, reportedCount] =
    await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              sellingPrice: true,
              images: {
                select: { url: true, altText: true },
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip,
      }),
      prisma.review.count({ where: whereClause }),
      prisma.review.count(),
      prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
      prisma.review.count({ where: { status: ReviewStatus.APPROVED } }),
      prisma.review.count({ where: { status: ReviewStatus.REJECTED } }),
      prisma.review.count({ where: { status: ReviewStatus.REPORTED } }),
    ]);

  return {
    reviews,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    counts: {
      all: allCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      reported: reportedCount,
    },
  };
}

/**
 * Admin: Moderate a review (approve/reject/flag/pending).
 */
export async function moderateReview(
  reviewId: string,
  action: ReviewStatus,
  moderatorNote?: string
) {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      status: action,
      moderatorNote: moderatorNote !== undefined ? moderatorNote : undefined,
    },
  });
}

/**
 * Admin: Permanently delete a review.
 */
export async function deleteReview(reviewId: string) {
  return prisma.review.delete({
    where: { id: reviewId },
  });
}
