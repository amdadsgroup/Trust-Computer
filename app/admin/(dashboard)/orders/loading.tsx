export default function OrdersLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-slate-200 rounded-xl" />
        <div className="h-4 w-40 bg-slate-100 rounded-lg" />
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-slate-200 rounded-xl" />
        ))}
      </div>

      {/* Search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 py-3.5 px-4 flex gap-6">
          {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
            <div key={h} className="h-3.5 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-3 px-4">
              <div className="space-y-1">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="h-3.5 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-14 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded" />
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
              <div className="h-8 w-24 bg-slate-100 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
