import { describe, it, expect } from 'vitest';
import prisma from '@/lib/db';
import {
  createReview,
  getProductReviews,
  getProductReviewStats,
  getAdminReviews,
  moderateReview,
  deleteReview,
} from '@/lib/reviews';

describe('Review System Service', () => {
  it(
    'should validate and create a review, compute statistics, and moderate',
    async () => {
    // 1. Find an active product
    const product = await prisma.product.findFirst({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    if (!product) {
      console.warn('No active product found to test reviews');
      return;
    }

    // 2. Create a test review
    const testReview = await createReview({
      productId: product.id,
      reviewerName: 'Test Reviewer Moulvibazar',
      rating: 5,
      title: 'Outstanding Laptop!',
      body: 'The laptop battery life is superb and delivery in Moulvibazar was ultra fast.',
    });

    expect(testReview).toBeDefined();
    expect(testReview.id).toBeDefined();
    expect(testReview.rating).toBe(5);
    expect(testReview.status).toBe('APPROVED');

    // 3. Retrieve product reviews
    const { reviews, totalCount } = await getProductReviews({
      productId: product.id,
    });

    expect(totalCount).toBeGreaterThan(0);
    const found = reviews.find((r) => r.id === testReview.id);
    expect(found).toBeDefined();
    expect(found?.reviewerName).toBe('Test Reviewer Moulvibazar');

    // 4. Retrieve product review stats
    const stats = await getProductReviewStats(product.id);
    expect(stats.totalReviews).toBeGreaterThan(0);
    expect(stats.averageRating).toBeGreaterThanOrEqual(1);
    expect(stats.breakdown[5].count).toBeGreaterThan(0);

    // 5. Retrieve admin reviews list
    const adminData = await getAdminReviews({ status: 'ALL' });
    expect(adminData.totalCount).toBeGreaterThan(0);
    expect(adminData.counts.approved).toBeGreaterThan(0);

    // 6. Test moderation action
    const moderated = await moderateReview(testReview.id, 'APPROVED', 'Thank you for your feedback from Trust Computer!');
    expect(moderated.moderatorNote).toBe('Thank you for your feedback from Trust Computer!');

    // 7. Cleanup test review
    await deleteReview(testReview.id);

    // Verify deleted
    const checkDeleted = await prisma.review.findUnique({
      where: { id: testReview.id },
    });
    expect(checkDeleted).toBeNull();
    },
    30000
  );
});
