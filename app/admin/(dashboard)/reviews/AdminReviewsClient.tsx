'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  Clock,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { moderateReviewAction, deleteReviewAction } from './actions';
import { useToast } from '@/components/ui/toast';
import { ReviewStatus } from '@prisma/client';

export interface AdminReviewsClientProps {
  initialReviews: any[];
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
    reported: number;
  };
  averageRating: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function AdminReviewsClient({
  initialReviews,
  counts: initialCounts,
  averageRating,
  totalCount,
  currentPage,
  totalPages,
}: AdminReviewsClientProps) {
  const { success, error: toastError, info } = useToast();
  const [isPending, startTransition] = useTransition();

  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [counts, setCounts] = useState(initialCounts);
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Note modal state
  const [activeNoteReview, setActiveNoteReview] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');

  // Lightbox preview for customer review photos
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Filter reviews locally or handle moderation updates
  const filteredReviews = reviews.filter((rev) => {
    // Status filter
    if (activeStatus !== 'ALL' && rev.status !== activeStatus) return false;

    // Rating filter
    if (selectedRating !== 'ALL' && rev.rating !== parseInt(selectedRating, 10)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = rev.reviewerName?.toLowerCase().includes(q);
      const matchTitle = rev.title?.toLowerCase().includes(q);
      const matchBody = rev.body?.toLowerCase().includes(q);
      const matchProduct = rev.product?.name?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchBody && !matchProduct) return false;
    }

    return true;
  });

  const handleModerate = async (reviewId: string, status: ReviewStatus, note?: string) => {
    startTransition(async () => {
      const res = await moderateReviewAction(reviewId, status, note);
      if (res.success) {
        success(`Review status updated to ${status}.`);
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, status, moderatorNote: note !== undefined ? note : r.moderatorNote }
              : r
          )
        );
        // Update counts
        setCounts((prev) => {
          const oldStatus = reviews.find((r) => r.id === reviewId)?.status;
          const next = { ...prev };
          if (oldStatus === 'PENDING') next.pending = Math.max(0, next.pending - 1);
          if (oldStatus === 'APPROVED') next.approved = Math.max(0, next.approved - 1);
          if (oldStatus === 'REJECTED') next.rejected = Math.max(0, next.rejected - 1);
          if (oldStatus === 'REPORTED') next.reported = Math.max(0, next.reported - 1);

          if (status === 'PENDING') next.pending += 1;
          if (status === 'APPROVED') next.approved += 1;
          if (status === 'REJECTED') next.rejected += 1;
          if (status === 'REPORTED') next.reported += 1;
          return next;
        });
      } else {
        toastError(res.error || 'Failed to update review status.');
      }
    });
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    startTransition(async () => {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        success('Review deleted permanently.');
        const oldReview = reviews.find((r) => r.id === reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setCounts((prev) => {
          const next = { ...prev, all: Math.max(0, prev.all - 1) };
          if (oldReview?.status === 'PENDING') next.pending = Math.max(0, next.pending - 1);
          if (oldReview?.status === 'APPROVED') next.approved = Math.max(0, next.approved - 1);
          if (oldReview?.status === 'REJECTED') next.rejected = Math.max(0, next.rejected - 1);
          if (oldReview?.status === 'REPORTED') next.reported = Math.max(0, next.reported - 1);
          return next;
        });
      } else {
        toastError(res.error || 'Failed to delete review.');
      }
    });
  };

  const handleSaveNote = async () => {
    if (!activeNoteReview) return;
    await handleModerate(activeNoteReview.id, activeNoteReview.status, noteText.trim());
    setActiveNoteReview(null);
    setNoteText('');
  };

  const openNoteModal = (rev: any) => {
    setActiveNoteReview(rev);
    setNoteText(rev.moderatorNote || '');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Review Moderation</span>
            {counts.pending > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                {counts.pending} Pending
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor, moderate, approve, or respond to customer feedback across all products.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{counts.all}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{counts.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{counts.approved}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{counts.rejected}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Rating</p>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'} ★
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Reviews', count: counts.all },
              { id: 'PENDING', label: 'Pending', count: counts.pending, alert: counts.pending > 0 },
              { id: 'APPROVED', label: 'Approved', count: counts.approved },
              { id: 'REJECTED', label: 'Rejected', count: counts.rejected },
              { id: 'REPORTED', label: 'Reported', count: counts.reported },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeStatus === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeStatus === tab.id
                      ? 'bg-slate-700 text-white'
                      : tab.alert
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Rating filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Stars:</span>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars ★</option>
              <option value="4">4 Stars ★</option>
              <option value="3">3 Stars ★</option>
              <option value="2">2 Stars ★</option>
              <option value="1">1 Star ★</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, product title, or review keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No reviews found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reviews match the selected filter criteria or search query.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const reviewDate = new Date(rev.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const statusColors: Record<string, string> = {
              APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
              REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
              REPORTED: 'bg-purple-50 text-purple-700 border-purple-200',
            };

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-4"
              >
                {/* Top Row: Product and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  {/* Product Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0">
                      {rev.product?.images?.[0]?.url ? (
                        <Image
                          src={rev.product.images[0].url}
                          alt={rev.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs">
                          TC
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link
                        href={`/products/${rev.product?.slug}`}
                        target="_blank"
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-brand truncate block flex items-center gap-1 group"
                      >
                        <span className="truncate">{rev.product?.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand flex-shrink-0" />
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">SKU: {rev.product?.sku}</span>
                        {rev.product?.sellingPrice && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              ৳{Number(rev.product.sellingPrice).toLocaleString('en-BD')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Review Date */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        statusColors[rev.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rev.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{reviewDate}</span>
                  </div>
                </div>

                {/* Reviewer & Star Rating Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {rev.reviewerName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {rev.reviewerName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      {rev.customer?.email && (
                        <p className="text-[10px] text-slate-400">{rev.customer.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-800 ml-1">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5 pl-10 sm:pl-11">
                  {rev.title && (
                    <h4 className="font-bold text-sm text-slate-900">{rev.title}</h4>
                  )}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    {rev.body}
                  </p>

                  {/* Customer Attached Photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {rev.images.map((img: any, i: number) => (
                        <button
                          key={img.id || i}
                          type="button"
                          onClick={() => setLightboxImage(img.url)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-brand transition cursor-zoom-in"
                        >
                          <Image
                            src={img.url}
                            alt="Review photo"
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Staff Response / Moderator Note */}
                  {rev.moderatorNote && (
                    <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-brand font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Staff Response:</span>
                      </div>
                      <p className="text-slate-700">{rev.moderatorNote}</p>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {rev.status !== 'APPROVED' && (
                      <button
                        disabled={isPending}
                        onClick={() => handleModerate(rev.id, 'APPROVED')}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== 'REJECTED' && (
                      <button
                        disabled={isPending}
                        onClick={() => handleModerate(rev.id, 'REJECTED')}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => openNoteModal(rev)}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{rev.moderatorNote ? 'Edit Response' : 'Reply / Note'}</span>
                    </button>
                  </div>

                  <button
                    disabled={isPending}
                    onClick={() => handleDelete(rev.id)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-bold text-xs p-1.5 rounded-lg hover:bg-rose-50 transition ml-auto"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Staff Response / Moderator Note Modal */}
      {activeNoteReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Staff Response / Moderator Note
              </h3>
              <button
                onClick={() => setActiveNoteReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                This response will be visible publicly on the product page as an official response from Trust Computer.
              </p>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write an official response or internal moderation note (e.g., Thank you for shopping with Trust Computer!)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveNoteReview(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-5 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-md transition"
              >
                Save Response
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full h-[70vh]">
            <Image
              src={lightboxImage}
              alt="Enlarged review photo"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
