import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-verse-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-verse-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-verse-900 border border-verse-800 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-white">Access Forbidden</h2>
          <p className="text-sm text-slate-400">
            You do not possess administrative permissions to access the AI VERSE Admin Console.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Return to User Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
