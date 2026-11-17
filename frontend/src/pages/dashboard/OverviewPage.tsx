import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UsageSummary, RequestLogItem, ApiKeyItem } from '../../types';
import {
  CreditCard,
  KeyRound,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Terminal,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<RequestLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usageData, keysData, historyData] = await Promise.all([
          api.getUsageSummary().catch(() => null),
          api.getApiKeys().catch(() => []),
          api.getRequestHistory(5).catch(() => [])
        ]);
        if (usageData) setUsage(usageData);
        setKeys(keysData);
        setRecentLogs(historyData);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Developer Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Welcome back, {user?.displayName || 'Developer'} ({user?.email})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard/playground"
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open Playground</span>
          </Link>
          <Link
            to="/dashboard/keys"
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-verse-800 hover:bg-verse-700 text-slate-200 border border-verse-700 transition-all"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
            <span>Create Key</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subscription Plan Card */}
        <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Plan</span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">{user?.subscriptionPlan || 'STARTER'}</span>
            <span className="text-xs text-emerald-400 font-mono">active</span>
          </div>
          <p className="text-xs text-slate-400 flex items-center justify-between">
            <span>Priority Level: {user?.subscriptionPlan === 'ULTRA' ? 4 : user?.subscriptionPlan === 'PRO' ? 3 : user?.subscriptionPlan === 'BASIC' ? 2 : 1}</span>
            <Link to="/dashboard/subscription" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center">
              <span>Upgrade</span>
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </p>
        </div>

        {/* API Keys Count */}
        <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active API Keys</span>
            <KeyRound className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {keys.filter(k => k.status === 'active').length}
            </span>
            <span className="text-xs text-slate-500">keys provisioned</span>
          </div>
          <p className="text-xs text-slate-400">
            <Link to="/dashboard/keys" className="text-indigo-400 hover:text-indigo-300">
              Manage API keys →
            </Link>
          </p>
        </div>

        {/* Total Requests */}
        <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Requests</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {usage?.totalRequests ?? 0}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {usage?.successfulRequests ?? 0} ok
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {usage?.failedRequests ? `${usage.failedRequests} errors` : 'Zero errors recorded'}
          </p>
        </div>

        {/* Tokens & Latency */}
        <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tokens</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {usage?.totalTokens ? usage.totalTokens.toLocaleString() : 0}
            </span>
            <span className="text-xs text-slate-500">tokens</span>
          </div>
          <p className="text-xs text-slate-400">
            Avg Latency: <strong className="text-white font-mono">{usage?.averageLatencyMs ?? 0}ms</strong>
          </p>
        </div>
      </div>

      {/* Models Status and Entitlements */}
      <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Available Model Entitlements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-verse-950/60 border border-verse-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">CYRUS</p>
                <p className="text-xs text-slate-400">General Intelligence (Colab Worker)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              UNLOCKED
            </span>
          </div>

          <div className="p-4 bg-verse-950/60 border border-verse-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">CYRAN</p>
                <p className="text-xs text-slate-400">Advanced Reasoning (Kaggle Worker)</p>
              </div>
            </div>
            {['PRO', 'ULTRA'].includes(user?.subscriptionPlan || '') ? (
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UNLOCKED
              </span>
            ) : (
              <Link
                to="/dashboard/subscription"
                className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                PRO REQUIRED
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Recent Invocations
          </h3>
          <Link to="/dashboard/history" className="text-xs text-blue-400 hover:text-blue-300">
            View all history →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No API requests dispatched yet. Try sending a prompt in the Playground!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-verse-800 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Tokens</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-verse-800/60 font-mono">
                {recentLogs.map((log) => (
                  <tr key={log.requestId} className="hover:bg-verse-800/30">
                    <td className="py-2.5 px-3 text-slate-400">{log.requestId.slice(0, 16)}...</td>
                    <td className="py-2.5 px-3 font-semibold text-white uppercase">{log.modelId}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{log.latencyMs ? `${log.latencyMs.toFixed(0)}ms` : '-'}</td>
                    <td className="py-2.5 px-3">{log.totalTokens}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
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
