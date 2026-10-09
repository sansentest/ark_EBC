'use client';

import { useState } from 'react';
import { Search, MoreVertical, Play, Loader2, AlertCircle } from 'lucide-react';
import { triggerEBCLogin } from '@/app/actions/automationActions';
import Link from 'next/link';

type Student = {
  id: number;
  student_id: string;
  name: string;
  class_name: string;
  status: string;
};

export default function RecentLoginsTable({ recentStudents }: { recentStudents: Student[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorAlert, setErrorAlert] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const handleStartLogin = async (studentId: number) => {
    setLoadingId(studentId);
    setErrorAlert({show: false, message: ''});
    try {
      const serverHost = window.location.origin;
      const result = await triggerEBCLogin(studentId, serverHost);
      if (!result.success) {
        setErrorAlert({show: true, message: result.error || 'Unknown error occurred'});
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setErrorAlert({show: true, message: err.message || 'Error triggering login automation'});
    } finally {
      setLoadingId(null);
    }
  };

  const filteredStudents = recentStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "SUCCESS": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "FAILED": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "LOGIN STARTED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <>
      {errorAlert.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-[#11131a] border border-red-500/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Login Failed</h3>
              <p className="text-slate-400 text-sm mb-6">{errorAlert.message}</p>
              <button 
                onClick={() => { setErrorAlert({show: false, message: ''}); }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#11131a]/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Logins</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Student ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Class</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">#{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.class_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(student.status)}`}>
                        {student.status === 'LOGIN STARTED' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />}
                        {student.status === 'SUCCESS' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />}
                        {student.status === 'FAILED' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />}
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleStartLogin(student.id)}
                          disabled={loadingId === student.id}
                          className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50" 
                          title="Force Login"
                        >
                          {loadingId === student.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        </button>
                        <Link href={`/ark_admin/students`} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No recent logins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/20 text-center">
          <Link href="/ark_admin/students" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View All Students &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
