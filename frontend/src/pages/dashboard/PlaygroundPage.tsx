import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Clock,
  Cpu,
  Sliders,
  AlertCircle,
  CornerDownLeft
} from 'lucide-react';

export const PlaygroundPage: React.FC = () => {
  const { user } = useAuth();
  const [model, setModel] = useState<'cyrus' | 'cyran'>('cyrus');
  const [systemPrompt, setSystemPrompt] = useState('You are CYRUS, an intelligent AI model developed by AM_77 for the AI VERSE platform.');
  const [userPrompt, setUserPrompt] = useState('Explain distributed queue architecture in modern AI systems.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const handleSend = async () => {
    if (!userPrompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setElapsed(0);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 500);

    try {
      const messages = [];
      if (systemPrompt.trim()) {
        messages.push({ role: 'system', content: systemPrompt.trim() });
      }
      messages.push({ role: 'user', content: userPrompt.trim() });

      const res = await api.createChatCompletion({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      });
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'Request execution failed.');
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (response?.choices?.[0]?.message?.content) {
      navigator.clipboard.writeText(response.choices[0].message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">API Playground</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Execute real model inference requests directly against the worker cluster
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Target:</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
            POST /v1/chat/completions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form & Parameters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Model Parameters</span>
            </h3>

            {/* Model Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model Family</label>
              <select
                value={model}
                onChange={(e) => {
                  const m = e.target.value as 'cyrus' | 'cyran';
                  setModel(m);
                  if (systemPrompt.includes('developed by AM_77')) {
                    setSystemPrompt(m === 'cyrus'
                      ? 'You are CYRUS, an intelligent AI model developed by AM_77 for the AI VERSE platform.'
                      : 'You are CYRAN, an advanced reasoning AI model developed by AM_77 for the AI VERSE platform.'
                    );
                  }
                }}
                className="w-full px-3 py-2 bg-verse-950 border border-verse-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="cyrus">CYRUS (General Intelligence - All Plans)</option>
                <option value="cyran">CYRAN (Advanced Reasoning - Pro & Ultra)</option>
              </select>
              {model === 'cyran' && !['PRO', 'ULTRA'].includes(user?.subscriptionPlan || '') && (
                <p className="text-[11px] text-amber-400 mt-1.5 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>CYRAN requires PRO (₹149/mo) or ULTRA (₹299/mo).</span>
                </p>
              )}
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                <span>Temperature</span>
                <span className="font-mono text-blue-400">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                <span>Max Tokens</span>
                <span className="font-mono text-blue-400">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="128"
                max="4096"
                step="128"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">System Prompt</label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Optional system guidance..."
                className="w-full p-2.5 bg-verse-950 border border-verse-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Prompt & Response Box */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="bg-verse-900 border border-verse-800 rounded-2xl p-5 space-y-4 flex-1 flex flex-col">
            {/* User Prompt Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">User Prompt</label>
              <textarea
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter prompt for CYRUS or CYRAN..."
                className="w-full p-3 bg-verse-950 border border-verse-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSend}
                  disabled={isLoading || !userPrompt.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? `Processing (${elapsed}s)...` : 'Dispatch Prompt'}</span>
                </button>
              </div>
            </div>

            {/* Output Display Area */}
            <div className="flex-1 flex flex-col border-t border-verse-800 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Model Output
                </span>
                {response && (
                  <button
                    onClick={copyResult}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Output'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-[220px] bg-verse-950 border border-verse-800 rounded-xl p-4 font-mono text-xs overflow-y-auto">
                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center space-y-3 py-12 text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-mono">
                      Queueing job & awaiting worker inference... ({elapsed}s)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Model: {model.toUpperCase()} · Priority Level {user?.subscriptionPlan === 'ULTRA' ? 4 : user?.subscriptionPlan === 'PRO' ? 3 : 1}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 space-y-1">
                    <p className="font-semibold text-xs flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Inference Execution Error</span>
                    </p>
                    <p className="text-xs text-rose-300">{error}</p>
                  </div>
                )}

                {response && (
                  <div className="space-y-4">
                    <p className="text-slate-100 whitespace-pre-wrap leading-relaxed text-sm font-sans">
                      {response.choices?.[0]?.message?.content}
                    </p>

                    <div className="border-t border-verse-800 pt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>ID: <code className="text-blue-400">{response.id}</code></span>
                      <span>Model: <code className="text-indigo-400 uppercase">{response.model}</code></span>
                      <span>Tokens: <code className="text-emerald-400">{response.usage?.total_tokens ?? 0}</code></span>
                      <span>Finish: <code className="text-slate-300">{response.choices?.[0]?.finish_reason}</code></span>
                    </div>
                  </div>
                )}

                {!isLoading && !error && !response && (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs py-12">
                    Enter a prompt above and click "Dispatch Prompt" to test worker inference.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
