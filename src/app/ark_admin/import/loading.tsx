export default function Loading() {
  return (
    <div className="space-y-8 fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-5 w-80 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse mt-1"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Configuration Section Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-[#11131a]/50 p-6 shadow-sm">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-6"></div>
            
            <div className="space-y-4 mb-6">
              <div>
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                <div className="h-11 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                <div className="h-11 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-48 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-[#11131a]/30 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
              <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
            </div>
          </div>
        </div>

        {/* Data Preview Section Skeleton */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-[#11131a]/50 h-full min-h-[400px] flex flex-col overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-full animate-pulse"></div>
              </div>
              <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
            
            <div className="flex-1 p-8 flex flex-col items-center justify-center animate-pulse">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-4"></div>
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2"></div>
              <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
