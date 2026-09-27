export default function PaymentsLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-72 bg-slate-200 rounded-xl" />
        <div className="h-4 w-64 bg-slate-100 rounded" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-8 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 py-3.5 px-4 flex gap-8">
          {['Date', 'Order', 'Method', 'Reference', 'Amount', 'Status'].map((h) => (
            <div key={h} className="h-3.5 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-3 px-4">
              <div className="h-3.5 w-24 bg-slate-100 rounded" />
              <div className="space-y-1">
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded" />
              <div className="h-3.5 w-24 bg-slate-100 rounded flex-1" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
