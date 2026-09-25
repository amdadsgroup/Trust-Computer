import { NextRequest, NextResponse } from 'next/server';
import { createReview, getProductReviews, getProductReviewStats } from '@/lib/reviews';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, rating, reviewerName, title, body: reviewBody, customerId } = body;

    if (!productId || !rating || !reviewerName || !reviewBody) {
      return NextResponse.json(
        { error: 'productId, rating, reviewerName, and body are required.' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const review = await createReview({
      productId,
      rating,
      reviewerName,
      title,
      body: reviewBody,
      customerId,
      isVerifiedPurchase: false, // Will be set by server based on order history
    });

    return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 });
  } catch (error: any) {
    const msg = error?.message || 'Failed to submit review.';
    const status = msg.includes('already submitted') ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
  }

  try {
    const [{ reviews, totalCount }, stats] = await Promise.all([
      getProductReviews({ productId, limit: 20 }),
      getProductReviewStats(productId),
    ]);

    return NextResponse.json({ reviews, totalCount, stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 });
  }
}
