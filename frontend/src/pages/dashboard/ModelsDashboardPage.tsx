import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ModelInfo } from '../../types';
import { Cpu, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ModelsDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getModels();
        setModels(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasAccess = (model: ModelInfo) => {
    const currentPlan = user?.subscriptionPlan || 'STARTER';
    return model.allowed_tiers.includes(currentPlan);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Model Registry</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Available model families and your current subscription entitlements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-500">Loading models...</div>
        ) : (
          models.map((m) => {
            const accessible = hasAccess(m);
            return (
              <div
                key={m.id}
                className="bg-verse-900 border border-verse-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{m.display_name}</h3>
                        <span className="text-xs text-blue-400 font-mono">{m.id}</span>
                      </div>
                    </div>
                    {accessible ? (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Lock className="w-3 h-3" />
                        <span>PRO / ULTRA ONLY</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>

                  <div className="border-t border-verse-800 pt-3 space-y-1.5 text-xs text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="text-slate-200">{m.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Context Window:</span>
                      <span className="text-slate-200">{m.context_window} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required Plans:</span>
                      <span className="text-blue-400">{m.allowed_tiers.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-verse-800 pt-3 flex justify-between items-center text-xs">
                  {accessible ? (
                    <Link
                      to="/dashboard/playground"
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Open in Playground</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/subscription"
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Upgrade Subscription to Unlock</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
