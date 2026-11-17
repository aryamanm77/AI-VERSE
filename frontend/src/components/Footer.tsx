import React from 'react';
import { Sparkles, Terminal, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-verse-800 bg-verse-950 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">AI VERSE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "One Universe. Infinite Intelligence." Production-grade multi-model AI API platform powered by Firebase and worker-pull orchestration.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Models</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/models" className="hover:text-blue-400">CYRUS (General Intelligence)</Link></li>
              <li><Link to="/models" className="hover:text-blue-400">CYRAN (Advanced Reasoning)</Link></li>
              <li><Link to="/docs" className="hover:text-blue-400">Model Registry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Developers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/docs" className="hover:text-blue-400">API Reference</Link></li>
              <li><Link to="/docs" className="hover:text-blue-400">OpenAI SDK Migration</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-400">Pricing & Priority</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-500">FastAPI Gateway</span></li>
              <li><span className="text-slate-500">Firebase Firestore</span></li>
              <li><span className="text-slate-500">Colab & Kaggle Compute</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-verse-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AI VERSE Inc. All rights reserved.</p>
          <p className="font-mono mt-2 sm:mt-0">CYRUS · CYRAN · Worker Protocol 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};
