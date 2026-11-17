import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowLeft, Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Ensure the address is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-verse-900 border border-verse-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400">Enter your email address to receive password reset instructions</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
            <p className="text-sm font-semibold text-emerald-400">Reset Link Dispatched</p>
            <p className="text-xs text-slate-300">
              Check your inbox for password recovery instructions.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Return to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
