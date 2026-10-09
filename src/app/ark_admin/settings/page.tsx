'use client';

import { User, Lock, Save, Bell, Shield, Key, Loader2, CheckCircle2, AlertCircle, Trash2, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { updatePasswordAction, deleteAllDataAction } from '@/app/actions/settingsActions';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');

  const handleDeleteData = () => {
    setShowDeleteModal(true);
  };

  const executeDeleteData = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    setMessage(null);
    const result = await deleteAllDataAction();
    setIsDeleting(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'All data deleted successfully.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete data.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    
    setLoading(true);
    setMessage(null);
    const result = await updatePasswordAction(currentPassword, newPassword);
    setLoading(false);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Password updated!' });
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update' });
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          System Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your admin profile, security preferences, and system configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar for Settings Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'profile' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            <User size={18} />
            <span>Profile Settings</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'security' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            <Shield size={18} />
            <span>Security & Access</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('danger')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'danger' 
                ? 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400' 
                : 'text-red-600/70 dark:text-red-400/70 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 border border-transparent'
            }`}
          >
            <AlertTriangle size={18} />
            <span>Danger Zone</span>
          </button>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 dark:bg-[#11131a]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm dark:shadow-2xl relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {activeTab === 'profile' && (
              <div className="fade-in">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <User size={20} className="text-indigo-500 dark:text-indigo-400" />
                  Admin Profile
                </h3>
                
                <div className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue="Super Admin"
                        disabled
                        className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Username</label>
                      <input 
                        type="text" 
                        defaultValue="admin"
                        disabled
                        className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed transition-all"
                      />
                      <p className="text-xs text-slate-500 ml-1">Username cannot be changed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="fade-in">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Key size={20} className="text-purple-500 dark:text-purple-400" />
                  Change Password
                </h3>
                
                {message && (
                  <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 max-w-md relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="fade-in">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-6 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Danger Zone
                </h3>
                
                {message && (
                  <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{message.text}</span>
                  </div>
                )}

                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 relative z-10">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div>
                      <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Delete All Data</h4>
                      <p className="text-sm text-red-600/80 dark:text-red-400/80 max-w-md">
                        This action will permanently delete all students and their login logs from the system. Use this only when resetting the system for a new term or environment.
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleDeleteData}
                      disabled={isDeleting}
                      className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-red-500/25 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)} />
          
          <div className="relative bg-[#1a1d27] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-500/10 fade-in animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                <AlertTriangle className="text-red-500 relative z-10" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">Delete All Data?</h3>
              <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                WARNING: This will permanently delete <strong className="text-red-400">ALL students</strong> and their <strong className="text-red-400">login logs</strong> from the database. 
                <br /><br />
                This action <strong className="text-white">CANNOT</strong> be undone. Are you absolutely sure?
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDeleteData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
