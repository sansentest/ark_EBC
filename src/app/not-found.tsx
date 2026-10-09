import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg p-8 relative z-10 fade-in animate-in zoom-in-95 duration-500 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/10 mb-8 relative group">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl animate-ping opacity-20" />
          <SearchX className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" size={48} />
        </div>
        
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-400 text-base mb-10 max-w-sm mx-auto leading-relaxed">
          Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        
        <div className="flex justify-center">
          <Link 
            href="/"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-medium text-white transition-all hover:scale-105 active:scale-95 shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Home size={18} className="text-indigo-400" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
