export default function ReportsLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-72 bg-slate-100 rounded" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-9 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded border-b border-slate-100 pb-3" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-24 bg-slate-200 rounded" />
                    <div className="h-3.5 w-16 bg-slate-100 rounded" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
