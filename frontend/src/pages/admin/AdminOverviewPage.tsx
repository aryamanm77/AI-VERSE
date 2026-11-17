import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Server,
  Layers,
  Users,
  ScrollText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getAdminOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Platform Operations & Administration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Real-time telemetry across workers, queue depth, and user subscriptions
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-mono">Loading operations telemetry...</div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium uppercase">Registered Users</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data?.totalUsers ?? 0}</p>
              <p className="text-[11px] text-emerald-400 font-mono">
                {data?.activeUsers ?? 0} active accounts
              </p>
            </div>

            {/* Workers Online */}
            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium uppercase">Worker Fleet</span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-emerald-400">{data?.workers?.online ?? 0}</span>
                <span className="text-xs text-slate-400">online</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {data?.workers?.busy ?? 0} busy · {data?.workers?.offline ?? 0} offline
              </p>
            </div>

            {/* Active Queue */}
            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium uppercase">Queue Depth</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data?.jobs?.queued ?? 0}</p>
              <p className="text-[11px] text-amber-400 font-mono">
                {data?.jobs?.processing ?? 0} currently processing
              </p>
            </div>

            {/* Completed Requests */}
            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium uppercase">Platform Requests</span>
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{data?.totalLogs ?? 0}</p>
              <p className="text-[11px] text-emerald-400 font-mono">
                {data?.jobs?.completed ?? 0} completed · {data?.jobs?.failed ?? 0} failed
              </p>
            </div>
          </div>

          {/* Subscription Breakdown */}
          <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Subscription Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['STARTER', 'BASIC', 'PRO', 'ULTRA'].map((tier) => {
                const count = data?.subscriptionDistribution?.[tier] ?? 0;
                return (
                  <div key={tier} className="p-4 bg-verse-950 border border-verse-800 rounded-xl">
                    <span className="text-xs font-mono font-bold text-slate-400">{tier}</span>
                    <p className="text-2xl font-extrabold text-white mt-1">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/workers"
              className="p-5 bg-verse-900 border border-verse-800 hover:border-blue-500/40 rounded-2xl transition-all group"
            >
              <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                <span>Manage Worker Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                Register Colab & Kaggle notebooks, issue worker credentials, and monitor telemetry.
              </p>
            </Link>

            <Link
              to="/admin/queue"
              className="p-5 bg-verse-900 border border-verse-800 hover:border-amber-500/40 rounded-2xl transition-all group"
            >
              <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>Inspect Request Queue</span>
                <ArrowRight className="w-4 h-4" />
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                View atomic job locks, active leases, priority ordering, and cancel stalled jobs.
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="p-5 bg-verse-900 border border-verse-800 hover:border-rose-500/40 rounded-2xl transition-all group"
            >
              <h4 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors flex items-center justify-between">
                <span>User Directory</span>
                <ArrowRight className="w-4 h-4" />
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                Audit registered users, manage privileges, and enforce account suspensions.
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
