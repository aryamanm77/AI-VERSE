import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Server,
  Layers,
  ScrollText,
  Users,
  Sliders,
  ArrowLeft
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const adminLinks = [
    { to: '/admin', label: 'Admin Overview', icon: ShieldAlert, end: true },
    { to: '/admin/workers', label: 'Worker Fleet', icon: Server },
    { to: '/admin/queue', label: 'Request Queue', icon: Layers },
    { to: '/admin/logs', label: 'Request Audit Logs', icon: ScrollText },
    { to: '/admin/users', label: 'User Directory', icon: Users },
  ];

  return (
    <aside className="w-64 border-r border-rose-950/40 bg-verse-950/90 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/40">
            ADM
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-400">Admin Console</p>
            <p className="text-[11px] text-slate-400 font-mono">Privileged Control</p>
          </div>
        </div>

        <nav className="space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
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

      <div className="p-4 border-t border-verse-800">
        <NavLink
          to="/dashboard"
          className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to User Dashboard</span>
        </NavLink>
      </div>
    </aside>
  );
};
