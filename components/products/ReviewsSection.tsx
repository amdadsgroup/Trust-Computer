'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  Camera,
  X,
  Filter,
  ChevronDown,
  MessageSquare,
  Sparkles,
  AlertCircle,
  UploadCloud,
  Check,
  Clock,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface ReviewsSectionProps {
  productId: string;
  productName: string;
  initialStats?: {
    averageRating: number;
    totalReviews: number;
    recommendedPercentage: number;
    breakdown: Record<number, { count: number; percentage: number }>;
  };
  initialReviews?: any[];
}

export default function ReviewsSection({
  productId,
  productName,
  initialStats,
  initialReviews,
}: ReviewsSectionProps) {
  const { success, error: toastError, info } = useToast();
  const { isBangla } = useLanguage();

  // Data state
  const [reviews, setReviews] = useState<any[]>(initialReviews || []);
  const [stats, setStats] = useState(
    initialStats || {
      averageRating: 0,
      totalReviews: 0,
      recommendedPercentage: 100,
      breakdown: {
        5: { count: 0, percentage: 0 },
        4: { count: 0, percentage: 0 },
        3: { count: 0, percentage: 0 },
        2: { count: 0, percentage: 0 },
        1: { count: 0, percentage: 0 },
      },
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox modal for customer photos
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Local state for helpful votes
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  // Auto-fetch customer profile if logged in
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/account/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.customer) {
            setReviewerName(data.customer.fullName || '');
            setReviewerEmail(data.customer.email || '');
            if (data.customer.phone) setReviewerPhone(data.customer.phone);
          }
        }
      } catch {
        // Not logged in or error, keep guest defaults
      }
    }
    fetchMe();
  }, []);

  // Fetch reviews based on active filters
  const fetchReviewsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: '10',
        sort: sortBy,
      });

      if (selectedRating !== null) {
        params.append('rating', selectedRating.toString());
      }
      if (verifiedOnly) {
        params.append('verifiedOnly', 'true');
      }

      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load reviews');

      const data = await res.json();
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error('Reviews load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, page, selectedRating, verifiedOnly, sortBy]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  // Handle image upload from file input
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toastError(
        isBangla
          ? 'সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।'
          : 'You can upload a maximum of 5 images.'
      );
      return;
    }

    setIsUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 4 * 1024 * 1024) {
          toastError(
            isBangla
              ? 'ছবির সাইজ ৪ মেগাবাইটের কম হতে হবে।'
              : `File ${file.name} exceeds 4MB limit.`
          );
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/reviews/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setUploadedImages((prev) => [...prev, data.url]);
        } else {
          toastError(data.error || 'Failed to upload image.');
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Image upload error.');
    } finally {
      setIsUploadingImage(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit review handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewerName.trim()) {
      toastError(isBangla ? 'আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }

    if (!reviewBody.trim() || reviewBody.trim().length < 5) {
      toastError(
        isBangla
          ? 'মতামত কমপক্ষে ৫ অক্ষরের হতে হবে।'
          : 'Review details must be at least 5 characters.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formRating,
          reviewerName: reviewerName.trim(),
          reviewerEmail: reviewerEmail.trim() || undefined,
          reviewerPhone: reviewerPhone.trim() || undefined,
          title: reviewTitle.trim() || undefined,
          body: reviewBody.trim(),
          imageUrls: uploadedImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      success(
        isBangla
          ? 'আপনার রিভিউ সফলভাবে গ্রহণ করা হয়েছে! ধন্যবাদ।'
          : 'Your review has been submitted successfully! Thank you.',
        'Review Submitted'
      );

      // Reset form
      setReviewTitle('');
      setReviewBody('');
      setUploadedImages([]);
      setIsFormOpen(false);

      // Refresh list
      fetchReviewsData();
    } catch (err: any) {
      toastError(err.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulVote = (reviewId: string) => {
    if (votedReviews[reviewId]) {
      info(isBangla ? 'আপনি ইতিমধ্যে ভোট দিয়েছেন।' : 'You already marked this review as helpful.');
      return;
    }

    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    success(
      isBangla ? 'ধন্যবাদ আপনার মতামতের জন্য!' : 'Thank you for your feedback!'
    );
  };

  const ratingLabels: Record<number, { en: string; bn: string }> = {
    5: { en: '5 Stars — Excellent!', bn: '৫ তারা — চমৎকার!' },
    4: { en: '4 Stars — Very Good', bn: '৪ তারা — খুব ভালো' },
    3: { en: '3 Stars — Average / Satisfactory', bn: '৩ তারা — মোটামুটি' },
    2: { en: '2 Stars — Below Expectations', bn: '২ তারা — সন্তোষজনক নয়' },
    1: { en: '1 Star — Poor', bn: '১ তারা — খারাপ' },
  };

  return (
    <div id="customer-reviews" className="scroll-mt-24 space-y-8">
      {/* Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
        {/* Header Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isBangla ? 'গ্রাহক রিভিউ ও রেটিং' : 'Customer Reviews & Ratings'}
              </h2>
              <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-brand-100">
                {stats.totalReviews} {isBangla ? 'টি রিভিউ' : 'Reviews'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isBangla
                ? `${productName} সম্পর্কে আমাদের বিশ্বস্ত ক্রেতাদের অভিজ্ঞতা ও মতামত।`
                : `Verified customer experiences and ratings for ${productName}.`}
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-brand-600/20 transition flex-shrink-0"
          >
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>{isBangla ? 'একটি রিভিউ লিখুন' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Aggregate Rating Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 rounded-2xl p-6 sm:p-8 border border-slate-200/80">
          {/* Big Score Block */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center sm:border-r border-slate-200/80 lg:pr-8">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '5.0'}
              </span>
              <span className="text-lg font-bold text-slate-400">/ 5.0</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.totalReviews > 0 ? stats.averageRating : 5)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium mt-2">
              {stats.totalReviews > 0
                ? isBangla
                  ? `${stats.totalReviews} জন ক্রেতার রেটিংয়ের ভিত্তিতে`
                  : `Based on ${stats.totalReviews} verified rating${stats.totalReviews === 1 ? '' : 's'}`
                : isBangla
                ? 'এখনও কোন রিভিউ জমা পড়েনি'
                : 'No reviews yet'}
            </p>

            {stats.totalReviews > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isBangla
                    ? `${stats.recommendedPercentage}% ক্রেতা সুপারিশ করেছেন`
                    : `${stats.recommendedPercentage}% of buyers recommend`}
                </span>
              </div>
            )}
          </div>

          {/* Breakdown Progress Bars */}
          <div className="lg:col-span-5 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const breakdownItem = stats.breakdown?.[star] || { count: 0, percentage: 0 };
              const isFiltered = selectedRating === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(isFiltered ? null : star)}
                  className={`w-full flex items-center gap-3 text-xs group transition rounded-lg p-1 -m-1 ${
                    isFiltered ? 'bg-amber-100/60 ring-1 ring-amber-300' : 'hover:bg-slate-200/50'
                  }`}
                >
                  <span className="w-12 font-bold text-slate-700 flex items-center gap-1 flex-shrink-0">
                    <span>{star}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </span>

                  {/* Progress Bar Container */}
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isFiltered
                          ? 'bg-amber-500'
                          : 'bg-amber-400 group-hover:bg-amber-500'
                      }`}
                      style={{ width: `${breakdownItem.percentage}%` }}
                    />
                  </div>

                  <span className="w-14 text-right font-medium text-slate-500 group-hover:text-slate-800 flex-shrink-0">
                    {breakdownItem.count} ({breakdownItem.percentage}%)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Trust Guarantees */}
          <div className="lg:col-span-3 lg:border-l border-slate-200/80 lg:pl-6 space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800 font-bold block">
                  {isBangla ? '১০০% আসল প্রোডাক্ট' : '100% Authentic'}
                </strong>
                {isBangla
                  ? 'মৌলভীবাজারের সবচেয়ে নির্ভরযোগ্য বিশ্বস্ত প্রযুক্তি শপ।'
                  : 'Official warranty and guaranteed genuine hardware.'}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800 font-bold block">
                  {isBangla ? 'যাচাইকৃত গ্রাহক রিভিউ' : 'Verified Purchases'}
                </strong>
                {isBangla
                  ? 'প্রকৃত ডেলিভারিকৃত অর্ডারের মাধ্যমে যাচাইকৃত।'
                  : 'Badges are awarded strictly to confirmed buyers.'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Rating filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedRating(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedRating === null
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {isBangla ? 'সব রিভিউ' : 'All Reviews'} ({stats.totalReviews})
            </button>

            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  selectedRating === r
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{r}</span>
                <Star
                  className={`w-3 h-3 ${
                    selectedRating === r ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'
                  }`}
                />
              </button>
            ))}

            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                verifiedOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isBangla ? 'শুধু বিশ্বস্ত ক্রেতা' : 'Verified Only'}</span>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {isBangla ? 'সাজান:' : 'Sort by:'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="newest">{isBangla ? 'নতুন রিভিউ প্রথম' : 'Newest First'}</option>
              <option value="highest">{isBangla ? 'সর্বোচ্চ রেটিং' : 'Highest Rating'}</option>
              <option value="lowest">{isBangla ? 'সর্বনিম্ন রেটিং' : 'Lowest Rating'}</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">
                {isBangla ? 'রিভিউ লোড হচ্ছে...' : 'Loading reviews...'}
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {selectedRating !== null || verifiedOnly
                  ? isBangla
                    ? 'এই ফিল্টারে কোন রিভিউ পাওয়া যায়নি'
                    : 'No reviews found with selected filters'
                  : isBangla
                  ? 'এই পণ্যের জন্য এখনও কোন রিভিউ নেই'
                  : 'Be the first to review this product!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isBangla
                  ? 'আপনার মূল্যবান অভিজ্ঞতা শেয়ার করুন এবং মৌলভীবাজারের অন্যান্য ক্রেতাদের সঠিক পণ্য বেছে নিতে সহায়তা করুন।'
                  : 'Share your genuine purchase experience and help other tech enthusiasts make informed decisions.'}
              </p>
              <button
                onClick={() => {
                  if (selectedRating !== null || verifiedOnly) {
                    setSelectedRating(null);
                    setVerifiedOnly(false);
                  } else {
                    setIsFormOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition mt-2"
              >
                {selectedRating !== null || verifiedOnly
                  ? isBangla
                    ? 'সব রিভিউ দেখুন'
                    : 'Reset Filters'
                  : isBangla
                  ? 'প্রথম রিভিউটি আপনি দিন'
                  : 'Write the First Review'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((rev) => {
                const reviewDate = new Date(rev.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                const initial = rev.reviewerName?.charAt(0).toUpperCase() || 'U';

                return (
                  <div key={rev.id} className="py-6 first:pt-2 space-y-3">
                    {/* Review Author & Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                          {initial}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">
                              {rev.reviewerName}
                            </span>

                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isBangla ? 'বিশ্বস্ত ক্রেতা' : 'Verified Buyer'}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {reviewDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Title & Body */}
                    <div className="pl-13 space-y-1.5">
                      {rev.title && (
                        <h4 className="font-bold text-sm text-slate-800">{rev.title}</h4>
                      )}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {rev.body}
                      </p>

                      {/* Photo Attachments */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {rev.images.map((img: any, idx: number) => (
                            <button
                              key={img.id || idx}
                              type="button"
                              onClick={() => setLightboxImage(img.url)}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 hover:ring-2 hover:ring-brand-500 transition cursor-zoom-in"
                            >
                              <Image
                                src={img.url}
                                alt={img.altText || 'Review photo'}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Moderator response note if present */}
                      {rev.moderatorNote && (
                        <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-brand font-bold text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Trust Computer Response</span>
                          </div>
                          <p className="text-slate-700">{rev.moderatorNote}</p>
                        </div>
                      )}

                      {/* Helpful Button */}
                      <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleHelpfulVote(rev.id)}
                          className={`inline-flex items-center gap-1.5 transition font-semibold ${
                            votedReviews[rev.id]
                              ? 'text-emerald-700'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${
                              votedReviews[rev.id] ? 'fill-emerald-600 text-emerald-600' : ''
                            }`}
                          />
                          <span>
                            {votedReviews[rev.id]
                              ? isBangla
                                ? 'ধন্যবাদ (উপকারী)'
                                : 'Helpful (1)'
                              : isBangla
                              ? 'উপকারী লেগেছে?'
                              : 'Helpful'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition"
              >
                {isBangla ? 'পূর্ববর্তী পৃষ্ঠা' : 'Previous'}
              </button>

              <span className="text-slate-500 font-medium">
                {isBangla ? `পৃষ্ঠা ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition"
              >
                {isBangla ? 'পরবর্তী পৃষ্ঠা' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {isBangla ? 'রিভিউ ও রেটিং দিন' : 'Write a Review'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{productName}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Star Rating Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {isBangla ? 'আপনার রেটিং নির্বাচন করুন *' : 'Overall Rating *'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || formRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setFormRating(star)}
                        className="p-1 focus:outline-none transition transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            active
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-amber-700">
                  {isBangla
                    ? ratingLabels[hoverRating || formRating]?.bn
                    : ratingLabels[hoverRating || formRating]?.en}
                </p>
              </div>

              {/* Reviewer Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isBangla ? 'আপনার নাম *' : 'Your Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder={isBangla ? 'যেমন: তানভীর আহমেদ' : 'e.g. Md. Tanvir Ahmed'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Email / Phone for verified purchase check (optional for guests) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isBangla ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    {isBangla ? 'অর্ডারের সাথে মিললে ব্যাজ দেওয়া হবে' : 'Used to verify purchase badge'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isBangla ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)'}
                  </label>
                  <input
                    type="tel"
                    value={reviewerPhone}
                    onChange={(e) => setReviewerPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isBangla ? 'রিভিউ শিরোনাম (ঐচ্ছিক)' : 'Review Title (Optional)'}
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder={
                    isBangla
                      ? 'যেমন: চমৎকার পারফরম্যান্স ও দ্রুত ডেলিভারি'
                      : 'e.g. Excellent gaming performance and genuine quality!'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Review Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {isBangla ? 'আপনার বিস্তারিত অভিজ্ঞতা *' : 'Detailed Review *'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {reviewBody.length} / 2000
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder={
                    isBangla
                      ? 'পণ্যটির বিল্ড কোয়ালিটি, পারফরম্যান্স বা ট্রাস্ট কম্পিউটারের সার্ভিস কেমন ছিল তা বিস্তারিত লিখুন...'
                      : 'Share your thoughts on build quality, gaming/work performance, packaging, or customer service...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y min-h-[100px]"
                />
              </div>

              {/* Photos Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {isBangla ? 'পণ্যের ছবি যোগ করুন (ঐচ্ছিক)' : 'Attach Photos (Optional)'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {uploadedImages.length} / 5
                  </span>
                </div>

                {/* Uploaded Thumbnails */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {uploadedImages.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group"
                      >
                        <Image
                          src={imgUrl}
                          alt="Review attachment"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(i)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-sm opacity-90 hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {uploadedImages.length < 5 && (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl p-4 cursor-pointer text-xs font-bold text-slate-600 hover:text-brand-600 transition bg-slate-50/50 hover:bg-brand-50/30">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                    {isUploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        <span>{isBangla ? 'ছবি আপলোড হচ্ছে...' : 'Uploading image...'}</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-brand-600" />
                        <span>
                          {isBangla
                            ? 'ছবি আপলোড করতে ক্লিক করুন (JPEG, PNG, WEBP)'
                            : 'Click to upload photos of this product'}
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-brand-600/20 disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isBangla ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isBangla ? 'রিভিউ জমা দিন' : 'Submit Review'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom for Attached Review Photos */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
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
              aria-label="Close image preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
