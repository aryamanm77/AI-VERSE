import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CreditCard, Check, Sparkles, Shield, ArrowUpRight } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const plans = [
    {
      id: 'STARTER',
      name: 'Starter',
      price: 0,
      priority: 1,
      models: ['CYRUS'],
      description: 'Free tier for personal exploration and small experiments.',
      features: ['Access to CYRUS model', 'OpenAI SDK compatible', 'Standard queue priority', 'Unlimited key creation']
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: 49,
      priority: 2,
      models: ['CYRUS'],
      description: 'Ideal for hobbyists and developers with consistent daily workflow.',
      features: ['Access to CYRUS model', 'Elevated queue priority (Level 2)', 'Usage analytics & logs', 'Standard developer support']
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 149,
      priority: 3,
      models: ['CYRUS', 'CYRAN'],
      description: 'Full multi-model universe for advanced engineering and production apps.',
      features: ['Access to CYRUS + CYRAN', 'High queue priority (Level 3)', 'Complex reasoning & coding', 'Priority developer support']
    },
    {
      id: 'ULTRA',
      name: 'Ultra',
      price: 299,
      priority: 4,
      models: ['CYRUS', 'CYRAN'],
      description: 'Top-tier scheduling for power developers and critical applications.',
      features: ['All model families', 'Highest queue priority (Level 4)', 'Immediate worker queue dispatch', 'Dedicated support channel']
    }
  ];

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlan(planId);
    setSuccessMsg(null);
    try {
      await api.upgradeSubscription(planId, 'manual');
      await refreshProfile();
      setSuccessMsg(`Successfully switched subscription to ${planId}!`);
    } catch (err: any) {
      alert(err.message || 'Upgrade failed.');
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Management</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Manage your subscription tier, queue scheduling priority, and model entitlements (INR)
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-semibold">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = user?.subscriptionPlan === p.id;
          return (
            <div
              key={p.id}
              className={`bg-verse-900 border rounded-2xl p-6 flex flex-col justify-between space-y-6 ${
                isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10' : 'border-verse-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="my-3">
                  <span className="text-3xl font-extrabold text-white">₹{p.price}</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{p.description}</p>

                <div className="space-y-2 border-t border-verse-800 pt-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Entitlements</span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center space-x-2 font-mono text-[11px] text-blue-400">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Models: {p.models.join(', ')}</span>
                    </li>
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-verse-800 text-slate-400 rounded-xl text-xs font-semibold cursor-default"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={upgradingPlan === p.id}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition-all disabled:opacity-50"
                  >
                    {upgradingPlan === p.id ? 'Switching...' : `Switch to ${p.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
