import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-48 bg-slate-200 rounded-md" />
        <div className="h-8 w-72 bg-slate-200 rounded-lg" />
        <div className="h-4 w-36 bg-slate-100 rounded-md" />
      </div>

      {/* Category Browse Bar Skeleton */}
      <div className="h-16 w-full bg-slate-100 rounded-2xl border border-slate-200" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-6">
            <div className="h-5 w-24 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-100 rounded-md" />
              <div className="h-7 w-full bg-slate-100 rounded-lg" />
              <div className="h-7 w-full bg-slate-100 rounded-lg" />
              <div className="h-7 w-full bg-slate-100 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-100 rounded-md" />
              <div className="h-7 w-full bg-slate-100 rounded-lg" />
              <div className="h-7 w-full bg-slate-100 rounded-lg" />
            </div>
          </div>
        </aside>

        {/* Main Products Grid Skeleton */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Image Placeholder */}
                <div className="aspect-[4/3] bg-slate-100 relative" />

                {/* Details Placeholder */}
                <div className="p-4 space-y-3">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-6 w-24 bg-slate-200 rounded-md" />
                    <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
