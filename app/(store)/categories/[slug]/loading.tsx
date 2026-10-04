import React from 'react';

export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-12 bg-slate-200 rounded" />
        <div className="h-3 w-3 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
        <div className="h-3 w-3 bg-slate-200 rounded" />
        <div className="h-3 w-28 bg-slate-200 rounded" />
      </div>

      {/* Category Header Banner Skeleton */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3 max-w-xl">
          <div className="h-4 w-36 bg-slate-700/80 rounded-full" />
          <div className="h-8 sm:h-9 w-64 sm:w-80 bg-slate-700 rounded-xl" />
          <div className="h-4 w-full max-w-md bg-slate-700/50 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-700/80 rounded-2xl shrink-0" />
      </div>

      {/* Filter and Sorting Bar Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <div className="h-8 w-24 bg-slate-200 rounded-xl shrink-0" />
          <div className="h-8 w-28 bg-slate-100 rounded-xl shrink-0" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl shrink-0" />
        </div>
        <div className="h-8 w-44 bg-slate-100 rounded-xl shrink-0 self-end md:self-auto" />
      </div>

      {/* Category Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs"
          >
            {/* Image Placeholder */}
            <div className="aspect-[4/3] bg-slate-100 relative" />

            {/* Details Placeholder */}
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-3.5 w-3/4 bg-slate-100 rounded" />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="h-6 w-24 bg-slate-200 rounded-md" />
                <div className="h-8 w-20 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
