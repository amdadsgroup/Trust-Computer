'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { moderateReview, deleteReview } from '@/lib/reviews';
import { ReviewStatus } from '@prisma/client';

export async function moderateReviewAction(
  reviewId: string,
  action: ReviewStatus,
  moderatorNote?: string
) {
  try {
    await requireAuth();

    await moderateReview(reviewId, action, moderatorNote);

    revalidatePath('/admin/reviews');
    revalidateTag('products');
    return { success: true };
  } catch (error: any) {
    console.error('Error moderating review:', error);
    return { success: false, error: error.message || 'Failed to moderate review' };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    await requireAuth();

    await deleteReview(reviewId);

    revalidatePath('/admin/reviews');
    revalidateTag('products');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message || 'Failed to delete review' };
  }
}

export async function batchModerateReviewAction(
  reviewIds: string[],
  action: ReviewStatus
) {
  try {
    await requireAuth();

    await Promise.all(
      reviewIds.map((id) => moderateReview(id, action))
    );

    revalidatePath('/admin/reviews');
    revalidateTag('products');
    return { success: true };
  } catch (error: any) {
    console.error('Error batch moderating reviews:', error);
    return { success: false, error: error.message || 'Failed to moderate reviews' };
  }
}
