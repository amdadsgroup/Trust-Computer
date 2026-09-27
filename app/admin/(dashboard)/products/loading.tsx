export default function ProductsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 rounded-xl" />
          <div className="h-4 w-40 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="flex gap-2">
          <div className="h-9 w-36 bg-slate-100 rounded-xl" />
          <div className="h-9 w-36 bg-slate-100 rounded-xl" />
          <div className="h-9 w-28 bg-slate-100 rounded-xl" />
          <div className="h-9 w-24 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 py-3.5 px-4 flex gap-8">
          {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
            <div key={h} className="h-3.5 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 px-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-3.5 w-20 bg-slate-100 rounded" />
              <div className="h-3.5 w-16 bg-slate-100 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
              <div className="h-7 w-20 bg-slate-100 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
