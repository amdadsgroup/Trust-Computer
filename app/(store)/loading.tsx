import React from 'react';

export default function StoreLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-44 sm:h-72 w-full bg-slate-200 rounded-2xl" />

      {/* Row of categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="aspect-square bg-slate-100 relative" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-6 w-24 bg-slate-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
