import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Terminal,
  KeyRound,
  Cpu,
  BarChart3,
  Clock,
  CreditCard,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/playground', label: 'Playground', icon: Terminal },
    { to: '/dashboard/keys', label: 'API Keys', icon: KeyRound },
    { to: '/dashboard/models', label: 'Models', icon: Cpu },
    { to: '/dashboard/usage', label: 'Usage Analytics', icon: BarChart3 },
    { to: '/dashboard/history', label: 'Request History', icon: Clock },
    { to: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
    { to: '/docs', label: 'API Reference', icon: BookOpen },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-verse-800 bg-verse-900/50 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6">
        {/* User Card */}
        <div className="p-3 bg-verse-800/60 border border-verse-700/60 rounded-xl flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.displayName || 'Developer'}</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${
                user?.subscriptionPlan === 'ULTRA' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                user?.subscriptionPlan === 'PRO' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' :
                user?.subscriptionPlan === 'BASIC' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                'bg-slate-700/40 text-slate-300'
              }`}>
                {user?.subscriptionPlan || 'STARTER'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-verse-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-verse-800 space-y-3">
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Admin Portal</span>
          </NavLink>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
