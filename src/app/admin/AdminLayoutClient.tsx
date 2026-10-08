'use client';

import { useState, useEffect } from "react";
import { ThemeToggle } from '@/components/ThemeToggle';
import SidebarNav from './SidebarNav';
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { logoutAction } from '@/app/actions/authActions';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0a0a0b] text-slate-900 dark:text-slate-200 overflow-hidden selection:bg-indigo-500/30 transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden fade-in" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-64 h-full border-r border-slate-200 dark:border-slate-800/60 bg-white/95 dark:bg-[#0a0a0b]/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap size={20} />
            </div>
            <span>EBC Admin</span>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <SidebarNav />

        <div className="p-4 border-t border-slate-200 dark:border-slate-800/60">
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all group">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-[#0a0a0b] dark:via-[#0f111a] dark:to-[#0a0a0b] transition-colors duration-300 w-full relative">
        
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-slate-800/30 bg-white/40 dark:bg-[#0a0a0b]/40 backdrop-blur-md z-10 relative">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors p-1" onClick={() => setSidebarOpen(true)}>
              <Menu size={26} />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight line-clamp-1">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ThemeToggle />
            <div className="flex items-center gap-2 md:gap-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full pl-2 pr-3 md:pr-4 py-1 md:py-1.5 backdrop-blur-md shadow-sm">
              <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] md:text-xs font-bold text-white shrink-0">
                AD
              </div>
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">Admin User</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative w-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
