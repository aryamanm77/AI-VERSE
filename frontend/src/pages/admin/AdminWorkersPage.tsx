import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { WorkerItem } from '../../types';
import {
  Server,
  Plus,
  RefreshCw,
  Power,
  PowerOff,
  AlertTriangle,
  Copy,
  Check,
  Cpu,
  Clock,
  Activity,
  History
} from 'lucide-react';

export const AdminWorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedWorkerEvents, setSelectedWorkerEvents] = useState<any[]>([]);
  const [activeWorkerId, setActiveWorkerId] = useState<string | null>(null);

  // Form states
  const [workerId, setWorkerId] = useState('');
  const [modelId, setModelId] = useState('CYRUS');
  const [provider, setProvider] = useState('Google Colab');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTokenData, setCreatedTokenData] = useState<{ worker_id: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const loadWorkers = async () => {
    try {
      const data = await api.getAdminWorkers();
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
    const interval = setInterval(loadWorkers, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createAdminWorker({
        worker_id: workerId.trim(),
        model_id: modelId,
        provider,
        description
      });
      setCreatedTokenData({ worker_id: res.worker_id, token: res.token });
      setWorkerId('');
      setDescription('');
      await loadWorkers();
    } catch (err: any) {
      alert(err.message || 'Worker creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (wId: string, currentStatus: string) => {
    const enable = currentStatus === 'disabled';
    try {
      await api.toggleWorker(wId, enable);
      await loadWorkers();
    } catch (err: any) {
      alert(err.message || 'Toggle failed.');
    }
  };

  const handleViewEvents = async (wId: string) => {
    setActiveWorkerId(wId);
    try {
      const events = await api.getWorkerEvents(wId);
      setSelectedWorkerEvents(events);
      setIsEventModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch events.');
    }
  };

  const copyToken = () => {
    if (createdTokenData?.token) {
      navigator.clipboard.writeText(createdTokenData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Worker Fleet Management</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Provision, authorize, and observe distributed Google Colab and Kaggle GPU workers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadWorkers()}
            className="p-2 bg-verse-900 border border-verse-800 hover:bg-verse-800 rounded-xl text-slate-300 hover:text-white transition-colors"
            title="Refresh Fleet Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCreatedTokenData(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Worker</span>
          </button>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-verse-900 border border-verse-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">Loading worker fleet...</div>
        ) : workers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No workers provisioned. Click "Add New Worker" to generate your first Colab or Kaggle worker token.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-verse-950/60 border-b border-verse-800 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Worker ID</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Heartbeat</th>
                  <th className="py-3 px-4">GPU Telemetry</th>
                  <th className="py-3 px-4">Jobs (Done / Fail)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-verse-800/60 font-mono">
                {workers.map((w) => (
                  <tr key={w.workerId} className="hover:bg-verse-800/30">
                    <td className="py-3 px-4 font-bold text-white font-sans">{w.workerId}</td>
                    <td className="py-3 px-4 text-blue-400 font-bold">{w.modelId}</td>
                    <td className="py-3 px-4 text-slate-300">{w.provider}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        w.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        w.status === 'busy' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse' :
                        w.status === 'initializing' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' :
                        w.status === 'disabled' ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {w.lastHeartbeat ? new Date(w.lastHeartbeat).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {w.gpuName ? (
                        <span>{w.gpuName} ({w.gpuMemory ? `${Math.round(w.gpuMemory / 1024)}GB` : 'N/A'})</span>
                      ) : (
                        <span className="text-slate-600">Pending detection</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-bold">{w.completedJobs}</span> / <span className="text-rose-400 font-bold">{w.failedJobs}</span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 font-sans">
                      <button
                        onClick={() => handleViewEvents(w.workerId)}
                        className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-verse-800 transition-colors"
                        title="View Audit Events"
                      >
                        Events
                      </button>
                      <button
                        onClick={() => handleToggle(w.workerId, w.status)}
                        className={`text-xs px-2.5 py-1 rounded transition-colors font-semibold ${
                          w.status === 'disabled'
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        {w.status === 'disabled' ? 'Enable' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Worker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-verse-900 border border-verse-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Provision New Worker Daemon</h3>

            {createdTokenData ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <p>
                    <strong>Worker Token Generated!</strong> Reveal this token only once. Add it as <code className="font-mono text-white">CYRUS_WORKER_TOKEN</code> or <code className="font-mono text-white">CYRAN_WORKER_TOKEN</code> in your Colab or Kaggle Secrets.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Worker ID</label>
                  <p className="font-mono text-sm font-bold text-white mb-3">{createdTokenData.worker_id}</p>

                  <label className="block text-xs font-semibold text-slate-400 mb-1">Worker Secret Token</label>
                  <div className="flex items-center space-x-2 bg-verse-950 border border-verse-800 rounded-xl p-2.5 font-mono text-xs text-emerald-400">
                    <span className="truncate flex-1">{createdTokenData.token}</span>
                    <button onClick={copyToken} className="p-1.5 hover:bg-verse-800 rounded text-slate-300 hover:text-white">
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCreatedTokenData(null);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateWorker} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Worker ID</label>
                  <input
                    type="text"
                    required
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    placeholder="e.g. cyrus-colab-1 or cyran-kaggle-1"
                    className="w-full px-3.5 py-2.5 bg-verse-950 border border-verse-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Model</label>
                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-verse-950 border border-verse-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="CYRUS">CYRUS</option>
                      <option value="CYRAN">CYRAN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Compute Provider</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full px-3 py-2.5 bg-verse-950 border border-verse-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Google Colab">Google Colab</option>
                      <option value="Kaggle">Kaggle</option>
                      <option value="Local Dev">Local Dev</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Tesla T4 runtime on Colab Pro"
                    className="w-full px-3.5 py-2 bg-verse-950 border border-verse-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Provisioning...' : 'Provision Worker'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Worker Events Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-verse-900 border border-verse-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white font-mono">Worker Audit Trail: {activeWorkerId}</h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                Close
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {selectedWorkerEvents.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center font-mono">No audit events recorded.</p>
              ) : (
                selectedWorkerEvents.map((ev, i) => (
                  <div key={i} className="p-3 bg-verse-950 border border-verse-800 rounded-xl font-mono text-xs space-y-1">
                    <div className="flex justify-between text-blue-400">
                      <span className="font-bold">{ev.eventType}</span>
                      <span className="text-slate-500 text-[10px]">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300">{ev.message}</p>
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
