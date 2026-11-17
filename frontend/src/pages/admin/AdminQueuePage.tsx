import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { QueueJobItem } from '../../types';
import { Layers, RefreshCw, XCircle, Clock, CheckCircle2 } from 'lucide-react';

export const AdminQueuePage: React.FC = () => {
  const [jobs, setJobs] = useState<QueueJobItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const data = await api.getAdminQueue(statusFilter || undefined);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleCancelJob = async (jobId: string) => {
    if (!confirm(`Cancel queue job ${jobId}?`)) return;
    try {
      await api.cancelQueueJob(jobId);
      await loadJobs();
    } catch (err: any) {
      alert(err.message || 'Cancel failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Request Queue Operations</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Inspect atomic job locks, active leases, priority ordering, and queue state
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-verse-900 border border-verse-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="queued">Queued (Pending Worker)</option>
            <option value="assigned">Assigned / In Lease</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={() => loadJobs()}
            className="p-2 bg-verse-900 border border-verse-800 hover:bg-verse-800 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-verse-900 border border-verse-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">Inspecting queue...</div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">No jobs matching selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-verse-950/60 border-b border-verse-800 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Worker Assigned</th>
                  <th className="py-3 px-4">Retries</th>
                  <th className="py-3 px-4">Created Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-verse-800/60 font-mono">
                {jobs.map((j) => (
                  <tr key={j.jobId} className="hover:bg-verse-800/30">
                    <td className="py-3 px-4 text-blue-400 font-semibold">{j.jobId}</td>
                    <td className="py-3 px-4 text-white font-bold">{j.modelId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-verse-800 text-blue-400 border border-blue-500/20">
                        Level {j.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        j.status === 'queued' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' :
                        j.status === 'assigned' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse' :
                        j.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {j.assignedWorkerId || <span className="text-slate-600">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{j.retryCount}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(j.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      {['queued', 'assigned'].includes(j.status) ? (
                        <button
                          onClick={() => handleCancelJob(j.jobId)}
                          className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
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
