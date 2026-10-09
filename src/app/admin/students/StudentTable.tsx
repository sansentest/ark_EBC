'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Play, Edit, Trash2, Filter, Loader2, AlertCircle, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { triggerEBCLogin } from '@/app/actions/automationActions';

type Student = {
  id: number;
  student_id: string;
  name: string;
  class_name: string;
  role: string;
  username: string;
  status: string;
};

import { deleteStudentAction, updateStudentAction, deleteBulkStudentsAction } from '@/app/actions/studentActions';
import { X, CheckSquare } from 'lucide-react';

export default function StudentTable({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorAlert, setErrorAlert] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: number | null}>({show: false, id: null});
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState<{show: boolean, student: Student | null}>({show: false, student: null});
  const [editFormData, setEditFormData] = useState({ name: '', class_name: '', username: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Extract unique classes for filter dropdown
  const uniqueClasses = Array.from(new Set(students.map(s => s.class_name))).filter(Boolean).sort();

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setActionLoading(true);
    const res = await deleteStudentAction(deleteModal.id);
    setActionLoading(false);
    if (res.success) {
      setDeleteModal({show: false, id: null});
      window.location.reload();
    } else {
      toast.error(res.error || 'មានបញ្ហាក្នុងការលុបទិន្នន័យ');
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setActionLoading(true);
    const res = await deleteBulkStudentsAction(selectedIds);
    setActionLoading(false);
    if (res.success) {
      setBulkDeleteModal(false);
      setSelectedIds([]);
      window.location.reload();
    } else {
      toast.error(res.error || 'មានបញ្ហាក្នុងការលុបទិន្នន័យច្រើន');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.student) return;
    setActionLoading(true);
    const res = await updateStudentAction(editModal.student.id, editFormData);
    setActionLoading(false);
    if (res.success) {
      setEditModal({show: false, student: null});
      window.location.reload();
    } else {
      toast.error(res.error || 'មានបញ្ហាក្នុងការកែប្រែទិន្នន័យ');
    }
  };

  const handleStartLogin = async (studentId: number) => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      toast.error('⚠️ មុខងារ Auto Login នេះដំណើរការបានតែនៅលើម៉ាស៊ីន Local (កុំព្យូទ័ររបស់អ្នក) ប៉ុណ្ណោះ!');
      return;
    }
    setLoadingId(studentId);
    setErrorAlert({show: false, message: ''});
    try {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'LOGIN STARTED' } : s));
      const serverHost = window.location.origin;
      const result = await triggerEBCLogin(studentId, serverHost);
      if (!result.success) {
        toast.error(result.error || 'មានបញ្ហាក្នុងការបញ្ជា Login');
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'FAILED' } : s));
      } else {
        toast.success('បញ្ជា Login ជោគជ័យ!');
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'SUCCESS' } : s));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error triggering login automation');
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'FAILED' } : s));
    } finally {
      setLoadingId(null);
    }
  };

  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ total: 0, current: 0 });
  const [concurrentLimit, setConcurrentLimit] = useState(2); // Default to 2 browsers at once
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkClassFilter, setBulkClassFilter] = useState('ALL');
  const isCancelledRef = useRef(false);

  // Calculate students to run based on the bulk modal's class filter
  const studentsToRun = students.filter(s => {
    const isPending = s.status !== 'SUCCESS' && s.status !== 'LOGIN STARTED';
    const matchesClass = bulkClassFilter === 'ALL' || s.class_name === bulkClassFilter;
    return isPending && matchesClass;
  });

  // Open modal and sync filter
  const openBulkModal = () => {
    setBulkClassFilter(classFilter);
    setShowBulkModal(true);
  };

  const handleCancelBulk = () => {
    isCancelledRef.current = true;
    setBulkLoading(false);
    setShowBulkModal(false);
  };

  const executeBulkLogin = async () => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      toast.error('⚠️ មុខងារ Auto Login នេះដំណើរការបានតែនៅលើម៉ាស៊ីន Local (កុំព្យូទ័ររបស់អ្នក) ប៉ុណ្ណោះ!');
      setShowBulkModal(false);
      return;
    }
    if (studentsToRun.length === 0) return;

    setBulkLoading(true);
    isCancelledRef.current = false;
    setBulkProgress({ total: studentsToRun.length, current: 0 });
    setErrorAlert({show: false, message: ''});

    const serverHost = window.location.origin;
    let processed = 0;

    // Cache the list of students to process to prevent array indexes from shifting
    // when local state updates during the execution.
    const targetStudents = [...studentsToRun];

    // Process in distinct chunks to ensure exactly N browsers open at the exact same time
    for (let i = 0; i < targetStudents.length; i += concurrentLimit) {
      if (isCancelledRef.current) {
        break; // Stop immediately before next chunk
      }

      const chunk = targetStudents.slice(i, i + concurrentLimit);
      
      const promises = chunk.map(async (student) => {
        setLoadingId(student.id);
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'LOGIN STARTED' } : s));
        try {
          const res = await fetch('/api/trigger-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: student.id, serverHost, closeBrowser: true })
          });
          const result = await res.json();
          if (result.success) {
            setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'SUCCESS' } : s));
          } else {
            setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'FAILED' } : s));
          }
        } catch (err) {
          console.error(err);
          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'FAILED' } : s));
        }
        setLoadingId(null);
        processed++;
        setBulkProgress({ total: targetStudents.length, current: processed });
      });

      // Wait for all browsers in this chunk to finish and close before starting the next chunk
      await Promise.all(promises);
    }

    setBulkLoading(false);
    setShowBulkModal(false);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || student.role === roleFilter;
    const matchesClass = classFilter === 'ALL' || student.class_name === classFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter, classFilter]);

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
                onClick={() => { setErrorAlert({show: false, message: ''}); window.location.reload(); }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
              >
                Close & Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-[#11131a] border border-slate-800/60 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Account</h3>
            <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete this account? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({show: false, id: null})}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
          <div className="bg-[#11131a] border border-red-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Trash2 size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">បញ្ជាក់ការលុបទិន្នន័យ</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សចំនួន <span className="font-bold text-red-400 text-base">{selectedIds.length} នាក់</span> នេះចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចទាញយកមកវិញបានឡើយ។
              </p>
              
              <div className="flex w-full gap-3 mt-2">
                <button 
                  onClick={() => setBulkDeleteModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
                  disabled={actionLoading}
                >
                  បោះបង់ (Cancel)
                </button>
                <button 
                  onClick={confirmBulkDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  លុបចេញ (Delete)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && editModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-[#11131a] border border-slate-800/60 p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Edit Account</h3>
              <button onClick={() => setEditModal({show: false, student: null})} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Name</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Class</label>
                <input 
                  type="text" 
                  value={editFormData.class_name}
                  onChange={(e) => setEditFormData({...editFormData, class_name: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                <input 
                  type="text" 
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditModal({show: false, student: null})}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Login Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4">
          <div className="bg-[#11131a] border border-slate-800/60 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Play fill="currentColor" size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Bulk Login Automation</h3>
                    <p className="text-sm text-slate-400">ស្វ័យប្រវត្តិកម្ម</p>
                  </div>
                </div>
                {!bulkLoading && (
                  <button onClick={() => setShowBulkModal(false)} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 ml-1">ជ្រើសរើសថ្នាក់ (Class)</label>
                  <select
                    value={bulkClassFilter}
                    onChange={(e) => setBulkClassFilter(e.target.value)}
                    disabled={bulkLoading}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none disabled:opacity-50"
                  >
                    <option value="ALL">គ្រប់ថ្នាក់ទាំងអស់ (All Classes)</option>
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls}>ថ្នាក់ {cls}</option>
                    ))}
                  </select>
                </div>

                {/* Concurrent Limit */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 ml-1">ចំនួន Chrome បើកព្រមគ្នា</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={concurrentLimit}
                    onChange={(e) => setConcurrentLimit(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    disabled={bulkLoading}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none disabled:opacity-50 text-center text-lg font-bold"
                  />
                  <div className="text-xs text-slate-500 font-medium px-1 text-center">
                    (កំណត់ចំនួនផ្ទាំង Chrome ដែលនឹងបើកដំណាលគ្នាក្នុង១ជុំ)
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-sm">សិស្សរង់ចាំ Login សរុប</span>
                    <span className="text-2xl font-black text-white">{studentsToRun.length} <span className="text-base font-medium text-slate-500">នាក់</span></span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
                    <AlertCircle className={studentsToRun.length === 0 ? "text-emerald-400" : "text-amber-400"} size={20} />
                  </div>
                </div>

                {/* Progress Bar (Only show when loading) */}
                {bulkLoading && (
                  <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-indigo-400">កំពុងដំណើរការ...</span>
                      <span className="text-white">{bulkProgress.current} / {bulkProgress.total}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 relative"
                        style={{ width: `${(bulkProgress.current / (bulkProgress.total || 1)) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  {bulkLoading ? (
                    <button
                      onClick={handleCancelBulk}
                      className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10"
                    >
                      <X size={18} />
                      បញ្ឈប់ដំណើរការ (Stop)
                    </button>
                  ) : (
                    <button
                      onClick={executeBulkLogin}
                      disabled={studentsToRun.length === 0}
                      className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:shadow-none"
                    >
                      {studentsToRun.length === 0 ? (
                        "មិនមានសិស្សត្រូវ Login ទេ"
                      ) : (
                        <>
                          <Play fill="currentColor" size={16} />
                          ចាប់ផ្តើម Auto Login
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#11131a]/60 backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-2xl flex flex-col h-[70vh]">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex-shrink-0">All Accounts <span className="text-sm font-normal text-slate-500 ml-2">({filteredStudents.length})</span></h3>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={openBulkModal}
              className="flex items-center justify-center gap-2 px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl transition-colors text-sm font-medium"
            >
              <Play size={14} fill="currentColor" />
              Bulk Auto Login
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="relative flex-shrink-0">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="TEACHER">Teachers</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>

          {/* Class Filter */}
          {uniqueClasses.length > 0 && (
            <div className="relative flex-shrink-0">
              <select 
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="ALL">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            </div>
          )}

          {/* Status Filter */}
          <div className="relative flex-shrink-0">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="NOT STARTED">Not Started</option>
              <option value="LOGIN STARTED">Login Started</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, name, class..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100/90 dark:bg-slate-900/80 backdrop-blur text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(paginatedStudents.map(s => s.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-medium">Student ID</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role & Class</th>
              <th className="px-6 py-4 font-medium">Username</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, student.id]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== student.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">#{student.student_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{student.role === 'TEACHER' ? 'Teacher' : 'Student'}</span>
                      <span className="text-slate-500 text-xs">{student.class_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{student.username}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(student.status)}`}>
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
                        title="Start EBC Login"
                      >
                        {loadingId === student.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                      </button>
                      <button 
                        onClick={() => {
                          setEditModal({show: true, student});
                          setEditFormData({ name: student.name, class_name: student.class_name, username: student.username });
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" 
                        title="Edit Student"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteModal({show: true, id: student.id})}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                        title="Delete Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <SearchX size={32} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">រកមិនឃើញទិន្នន័យទេ</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      មិនមានគណនីណាដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកឡើយ។
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-4 flex-wrap bg-slate-50 dark:bg-slate-900/30">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing <span className="font-medium text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredStudents.length)}</span> of <span className="font-medium text-slate-800 dark:text-slate-200">{filteredStudents.length}</span> accounts
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <div className="px-4 py-1.5 text-sm font-medium rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

