import { Users, UserCheck, UserX, UserMinus } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-8 fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-5 w-96 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse mt-1"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#11131a]/50 p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="space-y-4 w-full">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse h-12 w-12 shrink-0"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="w-full h-[400px] bg-white/50 dark:bg-[#11131a]/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse flex flex-col">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
        <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: `${((i * 17) % 60) + 20}%` }}></div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full bg-white/50 dark:bg-[#11131a]/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
