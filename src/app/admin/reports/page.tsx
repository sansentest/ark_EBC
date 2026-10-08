'use client';

import { Download, Filter, FileText, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { exportStudentDataCSV, exportLoginAnalyticsCSV, exportCustomReportCSV } from '@/app/actions/reportActions';

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const handleDownload = async (type: 'students' | 'analytics') => {
    setLoading(type);
    try {
      let result;
      let filename = '';
      if (type === 'students') {
        result = await exportStudentDataCSV();
        filename = `ebc_students_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        result = await exportLoginAnalyticsCSV();
        filename = `ebc_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      }

      if (result.success && result.data) {
        // Add UTF-8 BOM so Excel properly reads Khmer characters
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        alert(result.error || 'Failed to download report');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during download');
    } finally {
      setLoading(null);
    }
  };

  const handleCustomExport = async () => {
    setLoading('custom');
    try {
      const result = await exportCustomReportCSV({ role: filterRole, status: filterStatus });
      if (result.success && result.data) {
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `custom_report_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        alert(result.error || 'Failed to download report');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during download');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          System Reports
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Export data, generate login reports, and monitor system performance over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div onClick={() => handleDownload('students')} className="bg-white/80 dark:bg-[#11131a]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText size={64} className="text-indigo-400" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Student Data</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Export all student accounts with credentials.</p>
            <button className="text-sm font-medium text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              {loading === 'students' ? <Loader2 size={16} className="animate-spin" /> : 'Download CSV \u2192'}
            </button>
          </div>
        </div>

        <div onClick={() => handleDownload('analytics')} className="bg-white/80 dark:bg-[#11131a]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} className="text-emerald-400" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Login Analytics</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Export successful and failed login attempts.</p>
            <button className="text-sm font-medium text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              {loading === 'analytics' ? <Loader2 size={16} className="animate-spin" /> : 'Download Report \u2192'}
            </button>
          </div>
        </div>

        <div onClick={() => window.open('/print/summary', '_blank')} className="bg-white/80 dark:bg-[#11131a]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-all cursor-pointer shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar size={64} className="text-purple-400" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Monthly Summary</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Print or save as PDF via browser dialog.</p>
            <button className="text-sm font-medium text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Print / Save PDF &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#11131a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Custom Export</h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Filter Options'}
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/60 fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Role</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="NOT STARTED">Not Started</option>
                <option value="LOGIN STARTED">Login Started</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-800/60 rounded-xl bg-slate-50 dark:bg-slate-900/30">
          <Download size={48} className="text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">Export customized report based on filters</p>
          <div className="flex gap-4">
            <button 
              onClick={handleCustomExport}
              disabled={loading === 'custom'}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading === 'custom' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Download Custom CSV
            </button>
            <button 
              onClick={() => window.open(`/print/report?role=${filterRole}&status=${filterStatus}`, '_blank')}
              className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <FileText size={18} />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
