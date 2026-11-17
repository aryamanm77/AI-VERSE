import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { UserProfile } from '../../types';
import { Users, Search, RefreshCw, Shield, UserX, UserCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to mark user ${uid} as ${nextStatus}?`)) return;
    try {
      await api.updateUserStatus(uid, nextStatus);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase())) ||
      u.uid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Directory</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Platform accounts, subscription tiers, and access authorization
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, or UID..."
            className="px-3.5 py-2 bg-verse-900 border border-verse-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
          <button
            onClick={() => loadUsers()}
            className="p-2 bg-verse-900 border border-verse-800 hover:bg-verse-800 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-verse-900 border border-verse-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-verse-950/60 border-b border-verse-800 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-verse-800/60 font-mono">
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-verse-800/30">
                    <td className="py-3 px-4">
                      <p className="font-sans font-semibold text-white">{u.displayName || 'Unnamed User'}</p>
                      <p className="text-[10px] text-slate-500">{u.uid}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                        {u.subscriptionPlan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.accountStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleToggleStatus(u.uid, u.accountStatus)}
                        className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                          u.accountStatus === 'active'
                            ? 'text-rose-400 hover:bg-rose-500/10'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
