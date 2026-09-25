import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Star, CheckCircle2, XCircle, Clock, Flag, MessageSquare } from 'lucide-react';
import { moderateReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await requireAuth().catch(() => null);
  if (!session) redirect('/admin/login');

  const statusFilter = (searchParams.status as any) || 'PENDING';

  let reviews: any[] = [];
  let counts = { PENDING: 0, APPROVED: 0, REJECTED: 0, REPORTED: 0 };

  try {
    const [fetchedReviews, pendingCount, approvedCount, rejectedCount, reportedCount] =
      await Promise.all([
        prisma.review.findMany({
          where: { status: statusFilter },
          include: {
            product: { select: { name: true, slug: true } },
            customer: { select: { fullName: true, email: true } },
            images: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.review.count({ where: { status: 'PENDING' } }),
        prisma.review.count({ where: { status: 'APPROVED' } }),
        prisma.review.count({ where: { status: 'REJECTED' } }),
        prisma.review.count({ where: { status: 'REPORTED' } }),
      ]);

    reviews = fetchedReviews;
    counts = {
      PENDING: pendingCount,
      APPROVED: approvedCount,
      REJECTED: rejectedCount,
      REPORTED: reportedCount,
    };
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
  }

  const statusTabs = [
    { label: 'Pending', value: 'PENDING', count: counts.PENDING, icon: Clock, color: 'text-amber-600' },
    { label: 'Approved', value: 'APPROVED', count: counts.APPROVED, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Rejected', value: 'REJECTED', count: counts.REJECTED, icon: XCircle, color: 'text-rose-600' },
    { label: 'Reported', value: 'REPORTED', count: counts.REPORTED, icon: Flag, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Review Moderation</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Moderate customer reviews for Trust Computer products.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reviews?status=${tab.value}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              statusFilter === tab.value
                ? 'bg-brand text-white border-brand shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${statusFilter === tab.value ? 'text-white' : tab.color}`} />
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No {statusFilter.toLowerCase()} reviews</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                        />
                      ))}
                    </div>

                    {review.isVerifiedPurchase && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Verified Purchase
                      </span>
                    )}

                    <span className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString('en-BD')}
                    </span>
                  </div>

                  <div>
                    {review.title && (
                      <p className="font-bold text-slate-900 text-sm">{review.title}</p>
                    )}
                    <p className="text-sm text-slate-700 mt-1">{review.body}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      By: <strong className="text-slate-700">{review.reviewerName}</strong>
                    </span>
                    {review.customer && (
                      <span className="text-slate-400">({review.customer.email})</span>
                    )}
                    <span>
                      Product:{' '}
                      <Link
                        href={`/products/${review.product.slug}`}
                        target="_blank"
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        {review.product.name}
                      </Link>
                    </span>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusFilter !== 'APPROVED' && (
                    <form
                      action={async () => {
                        'use server';
                        await moderateReview(review.id, 'APPROVED');
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </form>
                  )}

                  {statusFilter !== 'REJECTED' && (
                    <form
                      action={async () => {
                        'use server';
                        await moderateReview(review.id, 'REJECTED');
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
