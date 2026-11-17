import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Terminal, Cpu, Zap, Shield, ArrowRight, Check, Copy } from 'lucide-react';

export const Home: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);

  const codeExample = `import openai

client = openai.OpenAI(
    base_url="https://api.aiverse.com/v1",
    api_key="sk_verse_YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="cyrus",  # or "cyran" for complex reasoning
    messages=[
        {"role": "user", "content": "Explain IoT in simple terms."}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>AI VERSE 1.0 — MULTI-MODEL WORKER ORCHESTRATION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            One Universe. <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Infinite Intelligence.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The multi-model AI API platform connecting high-performance GPU workers across Google Colab and Kaggle. 
            Drop-in OpenAI SDK compatibility with enterprise-grade queue security.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/register"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all text-sm w-full sm:w-auto justify-center"
            >
              <span>Get Free API Key</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/models"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-verse-900 hover:bg-verse-800 text-slate-200 border border-verse-700 font-semibold transition-all text-sm w-full sm:w-auto justify-center"
            >
              <span>Explore Model Families</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Model Family Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dual AI Model Architectures
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Decoupled public model identifiers routing dynamically to specialized GPU compute clusters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CYRUS Card */}
          <div className="bg-verse-900/60 border border-verse-800 rounded-2xl p-8 hover:border-blue-500/40 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                GENERAL INTELLIGENCE
              </span>
              <span className="text-xs text-slate-500 font-mono">cyrus</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              CYRUS
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              General-purpose intelligence designed for everyday conversations, structured summarization, conceptual explanation, and daily software engineering tasks.
            </p>
            <div className="space-y-2 border-t border-verse-800 pt-4 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Execution Provider:</span>
                <span className="text-slate-200">Google Colab (cyrus-colab-1)</span>
              </div>
              <div className="flex justify-between">
                <span>Available Tiers:</span>
                <span className="text-blue-400">STARTER, BASIC, PRO, ULTRA</span>
              </div>
            </div>
          </div>

          {/* CYRAN Card */}
          <div className="bg-verse-900/60 border border-verse-800 rounded-2xl p-8 hover:border-indigo-500/40 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ADVANCED REASONING
              </span>
              <span className="text-xs text-slate-500 font-mono">cyran</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              CYRAN
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              High-order reasoning engine tailored for complex coding challenges, multi-step technical analysis, algorithmic deduction, and demanding analytical workflows.
            </p>
            <div className="space-y-2 border-t border-verse-800 pt-4 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Execution Provider:</span>
                <span className="text-slate-200">Kaggle (cyran-kaggle-1)</span>
              </div>
              <div className="flex justify-between">
                <span>Available Tiers:</span>
                <span className="text-indigo-400">PRO, ULTRA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Integration Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-verse-900 border border-verse-800 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <Terminal className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Standard OpenAI SDK Compatibility
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Zero refactoring needed. Simply update your `base_url` to AI VERSE and authenticate with your cryptographically generated `sk_verse_...` key.
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Works with official Python and Node.js OpenAI SDKs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Real worker token and usage calculation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Fair queue leasing and lease expiration protection</span>
                </li>
              </ul>
            </div>

            {/* Code Box */}
            <div className="bg-verse-950 border border-verse-800 rounded-2xl overflow-hidden font-mono text-xs shadow-2xl relative">
              <div className="flex justify-between items-center px-4 py-3 bg-verse-900/80 border-b border-verse-800 text-slate-400">
                <span className="text-xs font-semibold">main.py (Python SDK)</span>
                <button
                  onClick={copyCode}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed">
                <code>{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
          Transparent, Fair Compute Plans (INR)
        </h2>
        <p className="text-sm text-slate-400 mb-10 max-w-xl mx-auto">
          No artificial requests-per-minute limits. Workload execution is scheduled by fair priority queues across active worker GPU instances.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="bg-verse-900/40 border border-verse-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">Starter</h4>
              <p className="text-xs text-slate-400 mt-1">Free personal tier</p>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-white">₹0</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-300">Access to CYRUS model with standard scheduling priority.</p>
            </div>
            <Link to="/register" className="mt-6 block text-center py-2 text-xs font-semibold rounded-lg bg-verse-800 hover:bg-verse-700 text-slate-200 transition-colors">
              Get Started
            </Link>
          </div>

          <div className="bg-verse-900/40 border border-verse-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">Basic</h4>
              <p className="text-xs text-slate-400 mt-1">Daily development</p>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-white">₹49</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-300">Access to CYRUS with elevated queue priority.</p>
            </div>
            <Link to="/register" className="mt-6 block text-center py-2 text-xs font-semibold rounded-lg bg-verse-800 hover:bg-verse-700 text-slate-200 transition-colors">
              Choose Basic
            </Link>
          </div>

          <div className="bg-verse-900/80 border border-blue-500/40 rounded-2xl p-6 flex flex-col justify-between relative shadow-lg shadow-blue-500/10">
            <span className="absolute -top-3 right-4 bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white">
              POPULAR
            </span>
            <div>
              <h4 className="text-lg font-bold text-white">Pro</h4>
              <p className="text-xs text-blue-300 mt-1">Full multi-model access</p>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-white">₹149</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-300">Access to CYRUS + CYRAN with high priority queue dispatch.</p>
            </div>
            <Link to="/register" className="mt-6 block text-center py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              Choose Pro
            </Link>
          </div>

          <div className="bg-verse-900/40 border border-verse-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">Ultra</h4>
              <p className="text-xs text-slate-400 mt-1">Maximum priority</p>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-white">₹299</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-300">Top queue priority across all model families for critical applications.</p>
            </div>
            <Link to="/register" className="mt-6 block text-center py-2 text-xs font-semibold rounded-lg bg-verse-800 hover:bg-verse-700 text-slate-200 transition-colors">
              Choose Ultra
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
