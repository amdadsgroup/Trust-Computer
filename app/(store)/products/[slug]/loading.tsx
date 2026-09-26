import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-64 bg-slate-200 rounded-md" />

      {/* Main Showcase Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200">
        {/* Gallery Image Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-2xl border border-slate-200" />
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200" />
            <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200" />
            <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200" />
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-8 w-4/5 bg-slate-200 rounded-lg" />
            <div className="h-5 w-48 bg-slate-100 rounded" />
          </div>

          <div className="h-10 w-40 bg-slate-200 rounded-xl" />

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="h-12 w-full bg-slate-200 rounded-xl" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
