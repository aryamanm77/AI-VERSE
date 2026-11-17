import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithGoogle, devLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevLogin = async (role: 'user' | 'admin') => {
    setError(null);
    setIsSubmitting(true);
    try {
      await devLogin(role);
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Dev login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-verse-900 border border-verse-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to AI VERSE</h2>
          <p className="text-xs text-slate-400">Access your API keys, worker playground, and analytics</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs transition-all shadow flex items-center justify-center space-x-2.5 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex-1 h-px bg-verse-800"></div>
          <span className="text-[11px] font-mono uppercase text-slate-500">or with email</span>
          <div className="flex-1 h-px bg-verse-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full px-3.5 py-2.5 bg-verse-950 border border-verse-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-verse-950 border border-verse-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Development Quick-Access Helpers */}
        <div className="border-t border-verse-800/80 pt-5 space-y-3">
          <p className="text-[11px] text-center font-mono text-slate-400 uppercase tracking-wider">
            Quick Dev Access Mode
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDevLogin('user')}
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-verse-800/80 hover:bg-verse-800 text-slate-200 border border-verse-700/60 rounded-xl text-xs font-medium transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>User Mode</span>
            </button>
            <button
              onClick={() => handleDevLogin('admin')}
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Mode</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
