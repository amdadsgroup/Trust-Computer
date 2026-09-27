export default function CustomersLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-slate-200 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 max-w-md bg-slate-100 rounded-xl" />
        <div className="h-10 w-24 bg-slate-200 rounded-xl" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 border-b border-slate-100 py-3 px-5 flex gap-8">
          {['Customer', 'Contact', 'Orders', 'Last Order', 'Joined'].map((h) => (
            <div key={h} className="h-3 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-3 px-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
                <div className="space-y-1">
                  <div className="h-3.5 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-1 flex-1">
                <div className="h-3 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-3.5 w-16 bg-slate-100 rounded" />
              <div className="space-y-1">
                <div className="h-3.5 w-16 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
