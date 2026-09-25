'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  images?: Array<{ url: string; altText?: string | null }>;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown: Array<{ rating: number; count: number }>;
}

interface ReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
  stats: ReviewStats;
}

function StarRating({
  rating,
  interactive = false,
  onRate,
  size = 'sm',
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
  size?: 'sm' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const iconSize = size === 'lg' ? 'w-7 h-7' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type={interactive ? 'button' : undefined}
          onClick={interactive && onRate ? () => onRate(s) : undefined}
          onMouseEnter={interactive ? () => setHover(s) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          className={interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none'}
        >
          <Star
            className={`${iconSize} transition ${
              s <= (hover || rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId, initialReviews, stats }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formRating === 0) {
      setError('Please select a star rating.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formRating,
          reviewerName: formData.get('reviewerName'),
          title: formData.get('title') || undefined,
          body: formData.get('body'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      setSubmitSuccess(true);
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      setFormRating(0);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-slate-100" id="reviews">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Customer Reviews</h2>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(stats.averageRating)} />
              <span className="text-sm font-bold text-slate-900">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">({stats.totalReviews} reviews)</span>
            </div>
          )}
        </div>

        {!showForm && !submitSuccess && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-bold bg-brand hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Breakdown */}
      {stats.totalReviews > 0 && (
        <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-sm">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.breakdown.find((b) => b.rating === rating)?.count ?? 0;
            const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2 py-0.5">
                <span className="text-xs text-slate-500 w-4">{rating}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-5">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Your Rating <span className="text-rose-500">*</span>
              </label>
              <StarRating rating={formRating} interactive onRate={setFormRating} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  name="reviewerName"
                  required
                  minLength={2}
                  maxLength={60}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand-300"
                  placeholder="e.g. Rahim Uddin"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                  Review Title
                </label>
                <input
                  name="title"
                  maxLength={120}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand-300"
                  placeholder="Summary in one line"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Review <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="body"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand-300 resize-none"
                placeholder="Share your experience with this product..."
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand hover:bg-brand-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-semibold">
            Thank you for your review! It will appear here after moderation.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Star className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="font-semibold">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this product.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="font-bold text-slate-900 text-sm">{review.title}</p>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{review.body}</p>

              <p className="text-xs text-slate-500 mt-3 font-semibold">— {review.reviewerName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
