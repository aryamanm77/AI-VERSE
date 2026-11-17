import React, { useState } from 'react';
import { Terminal, Copy, Check, BookOpen, Key, Cpu, ShieldCheck } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlExample = `curl https://api.aiverse.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk_verse_YOUR_KEY" \\
  -d '{
    "model": "cyrus",
    "messages": [
      {"role": "user", "content": "Explain IoT in simple terms."}
    ],
    "temperature": 0.7
  }'`;

  const pythonExample = `from openai import OpenAI

client = OpenAI(
    base_url="https://api.aiverse.com/v1",
    api_key="sk_verse_YOUR_KEY"
)

response = client.chat.completions.create(
    model="cyrus",
    messages=[{"role": "user", "content": "Hello AI Verse!"}]
)

print(response.choices[0].message.content)`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>DEVELOPER DOCUMENTATION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          AI VERSE API Reference
        </h1>
        <p className="mt-4 text-base text-slate-300 leading-relaxed">
          The AI VERSE API follows OpenAI-compatible standards. You can use existing official OpenAI SDKs or standard HTTP clients to dispatch prompts to our GPU worker infrastructure.
        </p>
      </div>

      {/* Quickstart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <Key className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white">1. Get API Key</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Register your developer account and generate a cryptographically secure key starting with <code className="text-blue-400 font-mono">sk_verse_...</code> in the API Keys dashboard.
          </p>
        </div>

        <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white">2. Select Model</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pass <code className="text-blue-400 font-mono">cyrus</code> for general everyday tasks or <code className="text-indigo-400 font-mono">cyran</code> for complex high-order reasoning.
          </p>
        </div>

        <div className="bg-verse-900 border border-verse-800 rounded-2xl p-6 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white">3. Queue Dispatch</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Requests are placed in the atomic queue with your subscription priority and executed by online Colab or Kaggle workers.
          </p>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">cURL Example</h2>
          <div className="bg-verse-950 border border-verse-800 rounded-2xl overflow-hidden font-mono text-xs">
            <div className="flex justify-between items-center px-4 py-3 bg-verse-900/80 border-b border-verse-800 text-slate-400">
              <span>Terminal cURL</span>
              <button
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="flex items-center space-x-1 hover:text-white"
              >
                {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'curl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-slate-200 overflow-x-auto">
              <code>{curlExample}</code>
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">Python OpenAI SDK</h2>
          <div className="bg-verse-950 border border-verse-800 rounded-2xl overflow-hidden font-mono text-xs">
            <div className="flex justify-between items-center px-4 py-3 bg-verse-900/80 border-b border-verse-800 text-slate-400">
              <span>python-sdk.py</span>
              <button
                onClick={() => copyToClipboard(pythonExample, 'python')}
                className="flex items-center space-x-1 hover:text-white"
              >
                {copiedKey === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'python' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-slate-200 overflow-x-auto">
              <code>{pythonExample}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Standard Error Schema */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Error Schema</h2>
        <p className="text-xs text-slate-400">
          The API produces structured, predictable error responses with standard HTTP status codes.
        </p>
        <div className="bg-verse-950 border border-verse-800 rounded-xl p-4 font-mono text-xs text-slate-300">
          <pre>{`{
  "error": {
    "message": "Model 'cyran' requires a PRO or ULTRA subscription.",
    "type": "insufficient_permissions",
    "code": "subscription_upgrade_required"
  }
}`}</pre>
        </div>
      </div>
    </div>
  );
};
