import React from 'react';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAdminReviews } from '@/lib/reviews';
import AdminReviewsClient from './AdminReviewsClient';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const session = await requireAuth().catch(() => null);
  if (!session) redirect('/admin/login');

  const { reviews, totalCount, page, totalPages, counts } = await getAdminReviews({
    status: 'ALL',
    pageSize: 50,
  });

  // Calculate overall store average rating
  const stats = await prisma.review.aggregate({
    where: { status: 'APPROVED' },
    _avg: { rating: true },
  });

  const averageRating = Number((stats._avg.rating ?? 5).toFixed(1));

  // Serialize Decimal objects from Product sellingPrice for client component props
  const serializedReviews = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    images: r.images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    })),
    product: r.product
      ? {
          ...r.product,
          sellingPrice: Number(r.product.sellingPrice),
        }
      : null,
  }));

  return (
    <AdminReviewsClient
      initialReviews={serializedReviews}
      counts={counts}
      averageRating={averageRating}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
