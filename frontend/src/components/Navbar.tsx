import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Terminal, Shield, LogOut, LayoutDashboard, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b border-verse-800 bg-verse-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                AI VERSE
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono tracking-wider">
                API PLATFORM
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link to="/models" className="hover:text-blue-400 transition-colors">Models</Link>
            <Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
            <Link to="/docs" className="hover:text-blue-400 transition-colors">Documentation</Link>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-verse-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
                >
                  Get API Key
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
