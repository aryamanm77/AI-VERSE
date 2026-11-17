import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { UsageSummary } from '../../types';
import { BarChart3, Activity, Clock, Zap, Cpu } from 'lucide-react';

export const UsagePage: React.FC = () => {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getUsageSummary();
        setUsage(data);
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
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Usage Analytics</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Real consumption metrics computed from your historical API logs
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading metrics...</div>
      ) : (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Requests</span>
              <p className="text-3xl font-extrabold text-white">{usage?.totalRequests ?? 0}</p>
              <p className="text-[11px] text-emerald-400 font-mono">
                {usage?.successfulRequests ?? 0} successful · {usage?.failedRequests ?? 0} errors
              </p>
            </div>

            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Total Tokens</span>
              <p className="text-3xl font-extrabold text-white">{usage?.totalTokens.toLocaleString() ?? 0}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                Prompt: {usage?.promptTokens ?? 0} · Completion: {usage?.completionTokens ?? 0}
              </p>
            </div>

            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Average Latency</span>
              <p className="text-3xl font-extrabold text-white">{usage?.averageLatencyMs ?? 0} ms</p>
              <p className="text-[11px] text-slate-400 font-mono">Worker inference + queue transit</p>
            </div>

            <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Success Rate</span>
              <p className="text-3xl font-extrabold text-emerald-400">
                {usage?.totalRequests ? `${((usage.successfulRequests / usage.totalRequests) * 100).toFixed(1)}%` : '100%'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">Zero unhandled dropouts</p>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Model Invocation Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(usage?.modelBreakdown || {}).length === 0 ? (
                <p className="text-xs text-slate-500 font-mono col-span-2 py-4">No model invocations yet.</p>
              ) : (
                Object.entries(usage?.modelBreakdown || {}).map(([mName, count]) => (
                  <div key={mName} className="p-4 bg-verse-950 border border-verse-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-bold text-white uppercase">{mName}</p>
                        <p className="text-xs text-slate-400 font-mono">{count} total invocations</p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-white font-mono">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
