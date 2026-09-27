export default function InventoryLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-80 bg-slate-100 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form skeleton */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded border-b border-slate-100 pb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-28 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
          <div className="h-11 w-full bg-slate-200 rounded-xl" />
        </div>

        {/* Ledger skeleton */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-slate-100 rounded-xl" />
            <div className="h-9 w-28 bg-slate-100 rounded-xl" />
            <div className="h-9 w-20 bg-slate-100 rounded-xl" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-2 border-b border-slate-50">
                <div className="h-3.5 w-20 bg-slate-100 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-20 bg-slate-100 rounded" />
                <div className="h-4 w-10 bg-slate-100 rounded" />
                <div className="h-4 w-8 bg-slate-100 rounded" />
                <div className="h-3.5 w-28 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
