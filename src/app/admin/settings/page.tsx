'use client';

import { User, Lock, Save, Bell, Shield, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { updatePasswordAction } from '@/app/actions/settingsActions';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

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
          </div>
        </div>
      </div>
    </div>
  );
}
