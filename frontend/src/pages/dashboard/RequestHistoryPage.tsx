import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { RequestLogItem } from '../../types';
import { Clock, CheckCircle2, XCircle, Search } from 'lucide-react';

export const RequestHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getRequestHistory(100);
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.requestId.toLowerCase().includes(search.toLowerCase()) ||
      l.modelId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Request History</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Full audit log of requests executed on the AI VERSE platform
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request or model..."
            className="w-full pl-9 pr-3.5 py-2 bg-verse-900 border border-verse-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-verse-900 border border-verse-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading request history...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-verse-950/60 border-b border-verse-800 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Prompt Tok</th>
                  <th className="py-3 px-4">Compl Tok</th>
                  <th className="py-3 px-4">Total Tok</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-verse-800/60 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.requestId} className="hover:bg-verse-800/30">
                    <td className="py-3 px-4 text-blue-400 font-semibold">{log.requestId}</td>
                    <td className="py-3 px-4 uppercase text-white font-bold">{log.modelId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{log.latencyMs ? `${log.latencyMs.toFixed(1)}ms` : '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{log.inputTokens}</td>
                    <td className="py-3 px-4 text-slate-400">{log.outputTokens}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{log.totalTokens}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
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
