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
  let averageRating = 5.0;
  try {
    const stats = await prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true },
    });
    if (stats._avg.rating) {
      averageRating = Number(stats._avg.rating.toFixed(1));
    }
  } catch {}

  // Serialize Decimal objects from Product sellingPrice for client component props
  const serializedReviews = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    images: (r.images || []).map((img: any) => ({
      ...img,
      createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : String(img.createdAt),
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
