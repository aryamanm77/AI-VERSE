import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { RequestLogItem } from '../../types';
import { ScrollText, RefreshCw, Search } from 'lucide-react';

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    try {
      const data = await api.getAdminLogs(200);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.requestId.toLowerCase().includes(search.toLowerCase()) ||
      (l.workerId && l.workerId.toLowerCase().includes(search.toLowerCase())) ||
      l.modelId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            System-wide request telemetry and worker execution performance logs
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request or worker..."
            className="px-3.5 py-2 bg-verse-900 border border-verse-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
          <button
            onClick={() => loadLogs()}
            className="p-2 bg-verse-900 border border-verse-800 hover:bg-verse-800 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-verse-900 border border-verse-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">No logs match search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-verse-950/60 border-b border-verse-800 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Worker ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Total Tokens</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-verse-800/60 font-mono">
                {filteredLogs.map((l) => (
                  <tr key={l.requestId} className="hover:bg-verse-800/30">
                    <td className="py-3 px-4 text-blue-400 font-semibold">{l.requestId}</td>
                    <td className="py-3 px-4 text-white font-bold uppercase">{l.modelId}</td>
                    <td className="py-3 px-4 text-slate-400">{l.workerId || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{l.latencyMs ? `${l.latencyMs.toFixed(1)}ms` : '-'}</td>
                    <td className="py-3 px-4 text-slate-200">{l.totalTokens}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
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
