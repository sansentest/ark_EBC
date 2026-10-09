export default function Loading() {
  return (
    <div className="space-y-8 fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-5 w-96 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse mt-1"></div>
      </div>

      {/* Table Section Skeleton */}
      <div className="w-full bg-white/50 dark:bg-[#11131a]/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        
        {/* Table Controls (Search/Filter) Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="h-10 w-full sm:w-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Table Body Skeleton */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex gap-4">
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse flex-1"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse flex-1"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse flex-1 hidden sm:block"></div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse hidden md:block"></div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="px-6 py-4 flex gap-4 items-center">
                <div className="h-4 w-8 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
                <div className="flex-1 flex gap-3 items-center">
                  <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 hidden sm:block">
                  <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
                </div>
                <div className="hidden md:flex gap-2 justify-end">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
