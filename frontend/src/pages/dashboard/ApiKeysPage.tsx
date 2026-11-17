import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ApiKeyItem } from '../../types';
import {
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<{ apiKey: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = async () => {
    try {
      const data = await api.getApiKeys();
      setKeys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const res = await api.createApiKey(keyName.trim());
      setCreatedKeyData({ apiKey: res.apiKey, name: res.name });
      setKeyName('');
      await loadKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to generate key.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Any applications using it will immediately fail.')) {
      return;
    }
    try {
      await api.revokeApiKey(keyId);
      await loadKeys();
    } catch (err: any) {
      alert(err.message || 'Revocation failed.');
    }
  };

  const copyCreatedKey = () => {
    if (createdKeyData?.apiKey) {
      navigator.clipboard.writeText(createdKeyData.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Key Management</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Cryptographically random keys for OpenAI SDK and HTTP client authentication
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedKeyData(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate New Key</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-verse-900 border border-verse-800 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No API keys created yet. Generate your first key to connect to the platform.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-verse-950/60 border-b border-verse-800 text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Key Name</th>
                <th className="py-3 px-4">Secret Prefix</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Last Used</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-verse-800/60 font-mono">
              {keys.map((k) => (
                <tr key={k.keyId} className="hover:bg-verse-800/30">
                  <td className="py-3 px-4 font-sans font-semibold text-white">{k.name}</td>
                  <td className="py-3 px-4 text-blue-400 font-bold">{k.keyPrefix}...</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      k.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    {k.status === 'active' ? (
                      <button
                        onClick={() => handleRevokeKey(k.keyId)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2 py-1 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[11px]">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-verse-900 border border-verse-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New API Key</h3>

            {createdKeyData ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <p>
                    <strong>Save this key now!</strong> For security reasons, the full plaintext key is displayed only once and cannot be recovered from the database.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your API Key</label>
                  <div className="flex items-center space-x-2 bg-verse-950 border border-verse-800 rounded-xl p-2.5 font-mono text-xs text-emerald-400">
                    <span className="truncate flex-1">{createdKeyData.apiKey}</span>
                    <button
                      onClick={copyCreatedKey}
                      className="p-1.5 hover:bg-verse-800 rounded text-slate-300 hover:text-white"
                      title="Copy Key"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCreatedKeyData(null);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  I Have Saved My Key
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Name</label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., Production App / Local Dev"
                    className="w-full px-3.5 py-2.5 bg-verse-950 border border-verse-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                    disabled={isCreating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Generating...' : 'Generate Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
