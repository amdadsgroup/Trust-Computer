import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/customer';
import { createReview, getProductReviews, getProductReviewStats } from '@/lib/reviews';
import { createReviewSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews?productId=...&rating=...&sort=...&page=...
 * Fetch reviews and stats for a product.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const ratingParam = searchParams.get('rating');
    const rating = ratingParam ? parseInt(ratingParam, 10) : undefined;
    const isVerifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const sortBy = (searchParams.get('sort') || 'newest') as 'newest' | 'highest' | 'lowest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const offset = (page - 1) * limit;

    const [{ reviews, totalCount }, stats] = await Promise.all([
      getProductReviews({
        productId,
        rating,
        isVerifiedOnly,
        sortBy,
        limit,
        offset,
      }),
      getProductReviewStats(productId),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submit a customer review.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate body
    const validated = createReviewSchema.parse(body);

    // Check if customer is currently logged in
    const currentCustomer = await getCurrentCustomer();

    const review = await createReview({
      productId: validated.productId,
      customerId: currentCustomer?.id,
      reviewerName: currentCustomer ? currentCustomer.fullName : validated.reviewerName,
      reviewerEmail: currentCustomer ? currentCustomer.email : validated.reviewerEmail,
      reviewerPhone: currentCustomer?.phone || validated.reviewerPhone || undefined,
      rating: validated.rating,
      title: validated.title,
      body: validated.body,
      imageUrls: validated.imageUrls,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your review has been submitted successfully.',
        review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting review:', error);

    // Zod validation errors
    if (error?.errors && Array.isArray(error.errors)) {
      const message = error.errors.map((e: any) => e.message).join(', ');
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to submit review.' },
      { status: 400 }
    );
  }
}
