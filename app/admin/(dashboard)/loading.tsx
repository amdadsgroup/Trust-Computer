import React from 'react';

export default function AdminLoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Metrics / Filter Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Filter / Search Bar skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-3">
        <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
        <div className="h-10 w-44 bg-slate-100 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="flex items-center justify-between py-3 border-b border-slate-50 gap-4">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-4 w-40 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
              <div className="h-8 w-16 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
