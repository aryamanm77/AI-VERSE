import React from 'react';
import { Cpu, CheckCircle2, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ModelsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          AI Model Families
        </h1>
        <p className="mt-4 text-base text-slate-300">
          Decoupled model endpoints designed for resilience, modular upgrades, and specialized inference tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CYRUS Detail */}
        <div className="bg-verse-900 border border-verse-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">CYRUS</h2>
                <p className="text-xs text-blue-400 font-mono">cyrus</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              General Purpose
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            The foundation model family designed for high-throughput daily interactions. Optimized for rapid response generation, clean prose synthesis, conceptual explanations, and boilerplate programming assistance.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Core Capabilities</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Text summarization and content structuring</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Technical prose, documentation generation, and grammar refinement</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>General coding in Python, JavaScript, TypeScript, Go, and SQL</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-verse-800 pt-6 flex justify-between items-center text-xs">
            <span className="text-slate-400">Included In: <strong className="text-white">All Plans (Starter+)</strong></span>
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1">
              <span>Test CYRUS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CYRAN Detail */}
        <div className="bg-verse-900 border border-verse-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">CYRAN</h2>
                <p className="text-xs text-indigo-400 font-mono">cyran</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Advanced Reasoning
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            The advanced reasoning engine built for demanding computational tasks. Capable of chain-of-thought analysis, bug localization across multi-file codebases, mathematical problem solving, and complex software architecture design.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Core Capabilities</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Multi-step deductive reasoning and logical problem synthesis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Deep code refactoring and algorithmic edge-case resolution</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Complex system design and distributed state machine modeling</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-verse-800 pt-6 flex justify-between items-center text-xs">
            <span className="text-slate-400">Included In: <strong className="text-white">PRO and ULTRA</strong></span>
            <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1">
              <span>Upgrade for CYRAN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
