import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, Zap, Info } from 'lucide-react';

export const PricingPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Simple, Transparent Pricing (INR)
        </h1>
        <p className="mt-4 text-base text-slate-300">
          Scalable access to AI VERSE compute infrastructure with zero fake monthly request quotas or arbitrary RPM limits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* STARTER */}
        <div className="bg-verse-900 border border-verse-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Personal</span>
            <h3 className="text-xl font-bold text-white mt-1">Starter</h3>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-white">₹0</span>
              <span className="text-xs text-slate-400"> / month</span>
            </div>
            <p className="text-xs text-slate-300 mb-6">
              Essential general intelligence for students, testing, and hobbyist projects.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Access to <strong>CYRUS</strong> model</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>OpenAI SDK endpoint</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Standard queue scheduling</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full Web Playground</span>
              </li>
            </ul>
          </div>
          <Link
            to="/register"
            className="mt-8 block text-center py-2.5 text-xs font-semibold rounded-xl bg-verse-800 hover:bg-verse-700 text-white transition-colors"
          >
            Create Free Account
          </Link>
        </div>

        {/* BASIC */}
        <div className="bg-verse-900 border border-verse-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-blue-400">Hobbyist</span>
            <h3 className="text-xl font-bold text-white mt-1">Basic</h3>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-white">₹49</span>
              <span className="text-xs text-slate-400"> / month</span>
            </div>
            <p className="text-xs text-slate-300 mb-6">
              Accelerated execution for developers requiring consistent daily throughput.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Access to <strong>CYRUS</strong> model</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Elevated Queue Priority (Level 2)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full Usage Analytics & History</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited API Keys</span>
              </li>
            </ul>
          </div>
          <Link
            to="/register"
            className="mt-8 block text-center py-2.5 text-xs font-semibold rounded-xl bg-verse-800 hover:bg-verse-700 text-white transition-colors"
          >
            Upgrade to Basic
          </Link>
        </div>

        {/* PRO */}
        <div className="bg-verse-900/80 border-2 border-blue-500 rounded-3xl p-6 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
          <span className="absolute -top-3 right-6 bg-blue-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow">
            MOST POPULAR
          </span>
          <div>
            <span className="text-xs font-mono font-bold uppercase text-blue-400">Engineer</span>
            <h3 className="text-xl font-bold text-white mt-1">Pro</h3>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-white">₹149</span>
              <span className="text-xs text-slate-400"> / month</span>
            </div>
            <p className="text-xs text-slate-300 mb-6">
              Unlocks the full intelligence universe including the CYRAN reasoning model.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Both <strong>CYRUS</strong> & <strong>CYRAN</strong> models</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>High Queue Scheduling (Level 3)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Complex reasoning & code generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Priority Developer Support</span>
              </li>
            </ul>
          </div>
          <Link
            to="/register"
            className="mt-8 block text-center py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-colors"
          >
            Choose Pro
          </Link>
        </div>

        {/* ULTRA */}
        <div className="bg-verse-900 border border-verse-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-amber-400">Enterprise</span>
            <h3 className="text-xl font-bold text-white mt-1">Ultra</h3>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-white">₹299</span>
              <span className="text-xs text-slate-400"> / month</span>
            </div>
            <p className="text-xs text-slate-300 mb-6">
              Maximum queue scheduling priority for mission-critical workflows.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>All Model Families (CYRUS & CYRAN)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>Highest Scheduling Priority (Level 4)</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Expedited Worker Queue Dispatch</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Real-time Audit Log Exports</span>
              </li>
            </ul>
          </div>
          <Link
            to="/register"
            className="mt-8 block text-center py-2.5 text-xs font-semibold rounded-xl bg-verse-800 hover:bg-verse-700 text-white transition-colors"
          >
            Choose Ultra
          </Link>
        </div>
      </div>

      {/* Compute Transparency Notice */}
      <div className="bg-verse-900/60 border border-verse-800 rounded-2xl p-6 flex items-start space-x-4">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">How AI VERSE Compute Scheduling Works</p>
          <p className="leading-relaxed text-slate-400">
            Unlike legacy SaaS APIs that enforce artificial rate caps, AI VERSE routes requests directly to active Google Colab and Kaggle GPU workers. Compute availability depends directly on connected worker daemon instances. Paid plans receive priority in the atomic job claiming queue.
          </p>
        </div>
      </div>
    </div>
  );
};
