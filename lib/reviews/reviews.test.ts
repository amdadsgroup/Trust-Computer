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
      if (!process.env.DATABASE_URL) {
        console.warn('Skipping integration test: DATABASE_URL not set in environment');
        return;
      }

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

      // 3. Fetch product reviews
      const reviewsResult = await getProductReviews({ productId: product.id });
      expect(reviewsResult.reviews.length).toBeGreaterThan(0);

      // 4. Fetch product statistics
      const stats = await getProductReviewStats(product.id);
      expect(stats.totalReviews).toBeGreaterThan(0);
      expect(stats.averageRating).toBeGreaterThanOrEqual(1);

      // 5. Test moderation
      const moderated = await moderateReview(testReview.id, 'APPROVED', 'Verified by test');
      expect(moderated.status).toBe('APPROVED');

      // 6. Test admin listing
      const adminList = await getAdminReviews({ status: 'ALL' });
      expect(adminList.reviews).toBeDefined();
      expect(adminList.counts.all).toBeGreaterThan(0);

      // 7. Clean up
      await deleteReview(testReview.id);
    },
    15000
  );
});
