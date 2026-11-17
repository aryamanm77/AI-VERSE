import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, Shield, Check, Mail, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(false);
    try {
      await api.updateProfile({ displayName: displayName.trim() });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Manage your developer profile and authentication credentials
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Profile successfully updated.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
          {error}
        </div>
      )}

      <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6 space-y-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-verse-950 border border-verse-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 bg-verse-950/50 border border-verse-800 rounded-xl text-sm text-slate-400 cursor-not-allowed font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Managed via Firebase Authentication</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">User UID</label>
            <input
              type="text"
              disabled
              value={user?.uid || ''}
              className="w-full px-3.5 py-2.5 bg-verse-950/50 border border-verse-800 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
