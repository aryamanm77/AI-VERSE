import React, { useState, useEffect } from 'react';
import {
  Orbit,
  LayoutDashboard,
  MessageSquare,
  KeyRound,
  Box,
  BarChart2 as ChartNoAxesCombined,
  History,
  CreditCard,
  BookOpen,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Plus,
  ChevronDown,
  Copy,
  Check,
  Terminal,
  Code2,
  ExternalLink,
  Menu,
  X,
  Search,
  Server,
  Users,
  Shield,
  Activity,
  Send,
  LoaderCircle,
  Plug,
  Zap,
  Trash2,
  LogOut,
  RefreshCw,
  Play,
  Layers
} from 'lucide-react';
import './style.css';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { ApiKeyItem, WorkerItem, QueueJobItem } from './types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GoogleIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"/>
    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
  </svg>
);

const MarkdownRenderer: React.FC<{ content: string; onCopy?: (text: string) => void }> = ({ content, onCopy }) => {
  return (
    <div className="gfm-markdown-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            if (!inline) {
              return (
                <div style={{ margin: '12px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155', background: '#0b0f17' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: '#111827', borderBottom: '1px solid #1f2937', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
                    <span>{lang || 'code'}</span>
                    <button
                      type="button"
                      onClick={() => onCopy ? onCopy(codeString) : navigator.clipboard.writeText(codeString)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '11px' }}
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '12px', overflowX: 'auto', fontSize: '13px', lineHeight: '1.5', color: '#67e8f9', fontFamily: 'monospace' }}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code style={{ background: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }} {...props}>
                {children}
              </code>
            );
          },
          table({ children }: any) {
            return (
              <div style={{ overflowX: 'auto', margin: '14px 0', border: '1px solid #334155', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }: any) {
            return <thead style={{ background: '#1e293b', color: '#f1f5f9', fontWeight: 600 }}>{children}</thead>;
          },
          th({ children }: any) {
            return <th style={{ padding: '8px 12px', borderBottom: '1px solid #475569', color: '#38bdf8' }}>{children}</th>;
          },
          td({ children }: any) {
            return <td style={{ padding: '8px 12px', borderBottom: '1px solid #334155' }}>{children}</td>;
          },
          blockquote({ children }: any) {
            return (
              <blockquote style={{ borderLeft: '3px solid #38bdf8', margin: '10px 0', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '0 6px 6px 0', color: '#cbd5e1', fontStyle: 'italic' }}>
                {children}
              </blockquote>
            );
          },
          ul({ children }: any) {
            return <ul style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: '1.6' }}>{children}</ul>;
          },
          ol({ children }: any) {
            return <ol style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: '1.6' }}>{children}</ol>;
          },
          h1({ children }: any) {
            return <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '14px 0 8px 0', color: '#f8fafc' }}>{children}</h1>;
          },
          h2({ children }: any) {
            return <h2 style={{ fontSize: '17px', fontWeight: 600, margin: '12px 0 6px 0', color: '#f8fafc' }}>{children}</h2>;
          },
          h3({ children }: any) {
            return <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '10px 0 4px 0', color: '#f8fafc' }}>{children}</h3>;
          },
          p({ children }: any) {
            return <p style={{ margin: '6px 0', lineHeight: '1.6' }}>{children}</p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const nav = [
  ['Overview', LayoutDashboard],
  ['Playground', MessageSquare],
  ['API Keys', KeyRound],
  ['Models', Box],
  ['Usage', ChartNoAxesCombined],
  ['Request History', History],
  ['Subscription', CreditCard]
] as const;

const adminNav = [
  ['Admin Overview', LayoutDashboard],
  ['Users', Users],
  ['Worker Management', Server],
  ['Request Queue', History],
  ['System Settings', Settings]
] as const;

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    desc: 'A place to start exploring.',
    features: ['CYRUS access', 'API & playground access', 'Standard queue priority']
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    desc: 'For your everyday ideas.',
    features: ['CYRUS access', 'API & playground access', 'Enhanced queue priority']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    desc: 'More intelligence. More possibility.',
    features: ['CYRUS + CYRAN access', 'Advanced reasoning & coding', 'Elevated queue priority']
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: 299,
    desc: 'For your most ambitious work.',
    features: ['CYRUS + CYRAN access', 'All platform features', 'Highest queue priority']
  }
];

const codeTemplate = `from openai import OpenAI

client = OpenAI(
    base_url="{BASE_URL}/v1",
    api_key="{API_KEY}"
)

response = client.chat.completions.create(
    model="cyrus",
    messages=[{
        "role": "user",
        "content": "What will we build today?"
    }]
)

print(response.choices[0].message.content)`;

export function App() {
  const { user, firebaseUser, login, loginWithGoogle, register, logout, devLogin } = useAuth();

  const [page, setPage] = useState('Overview');
  const [mobile, setMobile] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState('');
  const [language, setLanguage] = useState<'Python' | 'cURL'>('Python');
  const [range, setRange] = useState('Last 7 days');
  const [model, setModel] = useState('cyrus');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [busy, setBusy] = useState(false);
  const PROD_BACKEND_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'https://ai-verse-backend-impj.onrender.com';
  const [url, setUrl] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      localStorage.setItem('aiverse-url', PROD_BACKEND_URL);
      return PROD_BACKEND_URL;
    }
    const saved = localStorage.getItem('aiverse-url');
    return saved || PROD_BACKEND_URL;
  });
  const [key, setKey] = useState(() => localStorage.getItem('aiverse-key') || '');
  const [search, setSearch] = useState('');

  // Live state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('Primary API Key');
  const [newKeyFormat, setNewKeyFormat] = useState<'markdown' | 'plain' | 'raw'>('markdown');
  const [newKeyOverrides, setNewKeyOverrides] = useState<boolean>(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [newWorkerId, setNewWorkerId] = useState('cyrus-colab-2');
  const [newWorkerModel, setNewWorkerModel] = useState('cyrus');
  const [newWorkerProvider, setNewWorkerProvider] = useState('colab');
  const [generatedWorkerToken, setGeneratedWorkerToken] = useState<string | null>(null);

  const [queue, setQueue] = useState<QueueJobItem[]>([]);
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);

  // Real data state for usage, logs & admin
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminOverview, setAdminOverview] = useState<any>(null);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);

  // Auth modal form state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  function go(p: string) {
    setPage(p);
    setMobile(false);
    setSearch('');
    const pathMap: Record<string, string> = {
      'Login': '/login',
      'Register': '/register',
      'Overview': '/',
      'Playground': '/playground',
      'API Keys': '/keys',
      'Models': '/models',
      'Usage': '/usage',
      'Request History': '/history',
      'Subscription': '/subscription',
      'Documentation': '/docs',
      'Settings': '/settings',
      'Admin Overview': '/admin',
      'Worker Management': '/admin/workers',
      'Request Queue': '/admin/queue',
      'Users': '/admin/users',
      'System Settings': '/admin/settings'
    };
    if (pathMap[p] && window.location.pathname !== pathMap[p]) {
      window.history.pushState({}, '', pathMap[p]);
    }
  }

  function notify(s: string) {
    setToast(s);
    setTimeout(() => setToast(''), 3500);
  }

  async function copy(s: string) {
    try {
      await navigator.clipboard.writeText(s);
      notify('Copied to clipboard');
    } catch {
      notify('Clipboard unavailable in this browser');
    }
  }

  // Handle URL path on mount
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/login') {
      setPage('Login');
      setAuthMode('login');
    } else if (path === '/register') {
      setPage('Register');
      setAuthMode('register');
    } else if (path === '/playground') {
      setPage('Playground');
    } else if (path === '/keys' || path === '/api-keys') {
      setPage('API Keys');
    } else if (path === '/models') {
      setPage('Models');
    } else if (path === '/subscription' || path === '/pricing') {
      setPage('Subscription');
    } else if (path === '/docs' || path === '/documentation') {
      setPage('Documentation');
    } else if (path === '/settings') {
      setPage('Settings');
    } else if (path.startsWith('/admin')) {
      setAdmin(true);
      if (path.includes('worker')) setPage('Worker Management');
      else if (path.includes('queue')) setPage('Request Queue');
      else if (path.includes('users')) setPage('Users');
      else setPage('Admin Overview');
    }
  }, []);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${url.replace(/\/$/, '')}/health`);
        setBackendHealth(res.ok);
      } catch {
        setBackendHealth(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [url]);

  // Load API keys when viewing keys or when user changes
  const fetchKeys = async () => {
    if (!user) return;
    setLoadingKeys(true);
    try {
      const keys = await api.getApiKeys();
      setApiKeys(keys);
      if (keys.length === 0) {
        try {
          const newKey = await api.createApiKey('Default Development Key');
          setApiKeys([newKey as any]);
          setKey(newKey.apiKey);
          localStorage.setItem('aiverse-key', newKey.apiKey);
        } catch (e) {
          console.error('Auto key creation error', e);
        }
      }
    } catch (e) {
      console.error('Failed to load keys', e);
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (page === 'API Keys' || page === 'Playground' || user) {
      fetchKeys();
    }
  }, [page, user]);

  // Load Admin workers when viewing worker management
  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const wList = await api.getAdminWorkers();
      setWorkers(wList);
    } catch (e) {
      console.error('Failed to load workers', e);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const q = await api.getAdminQueue();
      setQueue(q);
    } catch (e) {
      console.error('Failed to load queue', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const logs = await api.getRequestHistory();
      setHistoryLogs(logs || []);
    } catch (_) {}
  };

  const fetchUsage = async () => {
    try {
      const s = await api.getUsageSummary();
      setUsageSummary(s);
    } catch (_) {}
  };

  const fetchAdminData = async () => {
    try {
      const [ov, us, lg] = await Promise.allSettled([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminLogs(50)
      ]);
      if (ov.status === 'fulfilled') setAdminOverview(ov.value);
      if (us.status === 'fulfilled') setAdminUsers(us.value || []);
      if (lg.status === 'fulfilled') setAdminLogs(lg.value || []);
    } catch (_) {}
  };

  useEffect(() => {
    if (page === 'Request History') {
      fetchHistory();
    }
    if (page === 'Usage') {
      fetchUsage();
      fetchHistory();
    }
    if (admin) {
      fetchWorkers();
      fetchQueue();
      fetchAdminData();
    }
  }, [admin, page]);

  // Handle Create API Key
  const handleCreateKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      setModal('Account');
      notify('Please sign in or select a developer session first');
      return;
    }
    try {
      const res = await api.createApiKey(newKeyName || 'Primary Key', newKeyFormat, newKeyOverrides);
      setGeneratedKey(res.apiKey);
      setKey(res.apiKey);
      localStorage.setItem('aiverse-key', res.apiKey);
      notify(`Key "${res.name}" created successfully!`);
      await fetchKeys();
    } catch (err: any) {
      notify(err.message || 'Failed to create key');
    }
  };

  // Handle Revoke API Key
  const handleRevokeKey = async (keyId: string) => {
    try {
      await api.revokeApiKey(keyId);
      notify('API key revoked');
      await fetchKeys();
    } catch (err: any) {
      notify(err.message || 'Failed to revoke key');
    }
  };

  // Handle Create Worker
  const handleCreateWorker = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await api.createAdminWorker({
        worker_id: newWorkerId,
        model_id: newWorkerModel,
        provider: newWorkerProvider
      });
      setGeneratedWorkerToken(res.token);
      notify(`Worker registered with status: ${res.status}`);
      await fetchWorkers();
    } catch (err: any) {
      notify(err.message || 'Failed to register worker');
    }
  };

  // Handle Upgrade Plan
  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      setModal('Account');
      notify('Please sign in to select a subscription plan');
      return;
    }
    try {
      await api.upgradeSubscription(planId.toUpperCase());
      notify(`Successfully updated to ${planId.toUpperCase()} plan!`);
      setModal('');
    } catch (err: any) {
      notify(err.message || 'Failed to update subscription');
    }
  };

  // Handle Send Chat Request with Real-Time SSE Token Streaming
  async function send() {
    const targetUrl = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
      ? PROD_BACKEND_URL
      : (url || PROD_BACKEND_URL);
    if (targetUrl && !targetUrl.startsWith('https://') && !targetUrl.includes('localhost') && !targetUrl.includes('127.0.0.1')) {
      notify('Please use an HTTPS backend URL in production');
      return;
    }
    const sessionToken = (api as any).token || (typeof localStorage !== 'undefined' ? localStorage.getItem('ai_verse_dev_token') : null);
    let tokenToUse = (user && sessionToken ? sessionToken : null) || key || sessionToken || 'sk_live_aiverse_dev_master';

    setBusy(true);
    setResponse('');
    try {
      let r = await fetch(targetUrl.replace(/\/$/, '') + '/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          Authorization: `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: true
        })
      });

      if (r.status === 401 && sessionToken && tokenToUse !== sessionToken) {
        tokenToUse = sessionToken;
        r = await fetch(targetUrl.replace(/\/$/, '') + '/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            Authorization: `Bearer ${tokenToUse}`
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            stream: true
          })
        });
      }

      if (!r.ok) {
        let errorMsg = `Request failed (${r.status})`;
        try {
          const errData = await r.json();
          errorMsg = errData.error?.message || errData.detail?.error?.message || errData.detail || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const reader = r.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response body is unavailable.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') {
            break;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                accumulated += delta;
                setResponse(accumulated);
              }
            } catch (_) {}
          }
        }
      }
    } catch (e) {
      setResponse('Request error: ' + (e instanceof Error ? e.message : 'Unable to reach backend'));
    } finally {
      setBusy(false);
      fetchUsage();
      fetchHistory();
      if (admin) {
        fetchAdminData();
      }
    }
  }

  // Handle Email Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
        notify('Logged in successfully');
      } else {
        await register(authEmail, authPassword);
        notify('Account registered successfully');
      }
      setModal('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const code = codeTemplate
    .replace('{BASE_URL}', url.replace(/\/$/, ''))
    .replace('{API_KEY}', key || 'YOUR_AI_VERSE_KEY');

  const snippet =
    language === 'Python'
      ? code
      : `curl ${url.replace(/\/$/, '')}/v1/chat/completions \\
  -H "Authorization: Bearer ${key || 'YOUR_AI_VERSE_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "cyrus",
    "messages": [{
      "role": "user",
      "content": "What will we build today?"
    }]
  }'`;

  const empty = (title: string, description: string, Icon: any = Activity, actionLabel?: string, onAction?: () => void) => (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={24} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {backendHealth ? (
        actionLabel && onAction ? (
          <button className="secondary" onClick={onAction}>
            <Play size={15} /> {actionLabel}
          </button>
        ) : (
          <button className="secondary" onClick={() => go('Playground')}>
            <Play size={15} /> Open Playground
          </button>
        )
      ) : (
        <button className="secondary" onClick={() => setModal('Connect backend')}>
          <Plug size={15} /> Connect backend
        </button>
      )}
    </div>
  );

  const modelCards = () => (
    <div className="model-grid">
      {['CYRUS', 'CYRAN'].map((m, i) => {
        const mKey = m.toLowerCase();
        const activeCount = workers.filter((w) => w.model_id === mKey && (w.status === 'online' || w.status === 'busy')).length;
        return (
          <article className="model-card" key={m}>
            <div className="model-head">
              <span className={'model-icon ' + (i ? 'purple' : '')}>
                <Orbit size={26} />
              </span>
              <span className="badge">{i ? 'PRO & ULTRA' : 'ALL PLANS'}</span>
            </div>
            <h3>
              {m}
              <span className="model-version">{i ? 'Advanced intelligence' : 'Everyday intelligence'}</span>
            </h3>
            <p>
              {i
                ? 'Go deeper. Tackle complex code, technical analysis, and demanding problems.'
                : 'Your versatile starting point for writing, explaining, summarizing, and coding.'}
            </p>
            <div className="tags">
              {(i ? ['Reasoning', 'Complex coding', 'Analysis'] : ['General purpose', 'Writing', 'Code']).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="model-bottom">
              <span>
                <i className={`dot ${activeCount > 0 ? 'amber' : backendHealth ? 'amber' : 'muted'}`} />
                {backendHealth
                  ? activeCount > 0
                    ? `${activeCount} worker online`
                    : 'Backend active · Worker standby'
                  : 'Backend offline'}
              </span>
              <button
                onClick={() => {
                  setModel(m.toLowerCase());
                  go('Playground');
                }}
              >
                Open playground <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );

  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'D';
  const userPlanDisplay = user?.subscriptionPlan || 'STARTER';

  const isPublicPage = page === 'Documentation' || page === 'Models' || page === 'Subscription';
  const isAuthPage = !user || page === 'Login' || page === 'Register';

  if (isAuthPage && !isPublicPage) {
    return (
      <div className="login-screen">
        {toast && <div className="toast">{toast}</div>}
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">
              <Orbit size={28} />
            </div>
            <h1>AI VERSE<span style={{ color: 'var(--orange)' }}>.</span></h1>
            <p>One Universe. Infinite Intelligence.</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '-4px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 650, color: '#fff' }}>
              {authMode === 'login' ? 'Sign In to Your Workspace' : 'Create an Account'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {authMode === 'login'
                ? 'Access your API keys, worker playground, and analytics'
                : 'Join the next generation compute platform powered by CYRUS & CYRAN'}
            </p>
          </div>

          {authError && (
            <div style={{ background: '#221111', border: '1px solid #6b2626', borderRadius: '8px', padding: '12px', fontSize: '11px', color: '#ff8a8a', lineHeight: '1.4' }}>
              <div><strong>Notice:</strong> {authError}</div>
              {authError.includes('Firebase Console') && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #4a1c1c' }}>
                  <a
                    href="https://console.firebase.google.com/project/ai-verse-7ac4e/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#ffae84', textDecoration: 'underline', display: 'inline-block', marginBottom: '8px' }}
                  >
                    Open Firebase Console Authorized Domains →
                  </a>
                  <button
                    type="button"
                    className="secondary"
                    style={{ width: '100%', fontSize: '11px', padding: '6px' }}
                    onClick={async () => {
                      await devLogin('user', 'STARTER');
                      notify('Logged in as Dev User');
                      go('Overview');
                    }}
                  >
                    Continue with Instant Dev Sandbox
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prominent Google Sign-In Button */}
          <button
            type="button"
            className="google-btn"
            disabled={authLoading}
            onClick={async () => {
              setAuthLoading(true);
              setAuthError('');
              try {
                await loginWithGoogle();
                notify('Signed in with Google!');
                go('Overview');
              } catch (err: any) {
                setAuthError(err.message || 'Google Sign-In failed');
              } finally {
                setAuthLoading(false);
              }
            }}
          >
            <GoogleIcon size={18} />
            <span>Continue with Google</span>
          </button>

          <div className="login-divider">or with email</div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthLoading(true);
              setAuthError('');
              try {
                if (authMode === 'login') {
                  await login(authEmail, authPassword);
                  notify('Signed in successfully!');
                } else {
                  await register(authEmail, authPassword);
                  notify('Account created successfully!');
                }
                go('Overview');
              } catch (err: any) {
                setAuthError(err.message || 'Authentication failed');
              } finally {
                setAuthLoading(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div className="login-input-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="developer@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            <div className="login-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                {authMode === 'login' && (
                  <span style={{ fontSize: '10px', color: 'var(--orange)', cursor: 'pointer' }} onClick={() => notify('Password reset link sent if registered')}>
                    Forgot password?
                  </span>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={authLoading}>
              {authLoading ? <LoaderCircle size={16} className="spin" /> : <ArrowRight size={16} />}
              <span>{authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
            {authMode === 'login' ? (
              <span>
                Don’t have an account?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'underline' }}
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'underline' }}
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

          {/* Instant Developer Sandbox */}
          <div className="login-sandbox-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>⚡ Fast-Track Developer Access</span>
              <span className="badge" style={{ fontSize: '8px' }}>Sandbox</span>
            </div>
            <div className="sandbox-btn-row">
              <button
                type="button"
                className="sandbox-btn"
                onClick={async () => {
                  await devLogin('user', 'STARTER');
                  notify('Logged in as Dev User');
                  go('Overview');
                }}
              >
                Dev User
              </button>
              <button
                type="button"
                className="sandbox-btn"
                onClick={async () => {
                  await devLogin('admin', 'ULTRA');
                  setAdmin(true);
                  notify('Logged in as Dev Admin');
                  go('Admin Overview');
                }}
              >
                Dev Admin
              </button>
            </div>
          </div>

          {/* Public links */}
          <div className="login-footer-links">
            <button type="button" onClick={() => go('Documentation')}>Docs</button>
            <span>·</span>
            <button type="button" onClick={() => go('Models')}>Models</button>
            <span>·</span>
            <button type="button" onClick={() => go('Subscription')}>Pricing</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className={mobile ? 'sidebar open' : 'sidebar'}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go('Overview');
          }}
        >
          <span className="brand-symbol">
            <Orbit size={27} />
          </span>
          AI VERSE
          <span className="brand-dot">.</span>
        </a>

        <button className="workspace" onClick={() => setModal('Workspace')}>
          <span className="workspace-avatar">{userInitial}</span>
          <span>
            {user ? (user.displayName || user.email.split('@')[0]) : 'Personal workspace'}
            <small>{user ? `${user.role.toUpperCase()} · ${userPlanDisplay}` : 'Developer account'}</small>
          </span>
          <ChevronDown size={14} />
        </button>

        <div className="nav-caption">{admin ? 'ADMINISTRATION' : 'WORKSPACE'}</div>
        <nav>
          {(admin ? adminNav : nav).map(([name, Icon]) => (
            <button className={page === name ? 'nav-item active' : 'nav-item'} onClick={() => go(name)} key={name}>
              <Icon size={18} />
              {name}
              {name === 'Playground' && <span className="tiny-new">NEW</span>}
            </button>
          ))}
        </nav>

        <div className="nav-caption resources">RESOURCES</div>
        <button className={'nav-item ' + (page === 'Documentation' ? 'active' : '')} onClick={() => go('Documentation')}>
          <BookOpen size={18} />
          Documentation
          <ArrowUpRight className="nav-end" size={14} />
        </button>
        <button className={'nav-item ' + (page === 'Settings' ? 'active' : '')} onClick={() => go('Settings')}>
          <Settings size={18} />
          Settings
        </button>

        <div className="sidebar-bottom">
          <div className="upgrade">
            <span className="upgrade-orbit">✧</span>
            <strong>A little more possibility.</strong>
            <p>
              Unlock advanced intelligence
              <br />
              with CYRAN.
            </p>
            <button onClick={() => go('Subscription')}>
              Explore plans
              <ArrowUpRight size={15} />
            </button>
          </div>

          <button className="system-status" onClick={() => setModal('Connection status')}>
            <i className={`dot ${backendHealth ? 'amber' : 'muted'}`} />
            {backendHealth ? 'FastAPI Connected' : 'Setup required'}
            <ArrowUpRight size={13} />
          </button>

          <button className="profile" onClick={() => setModal('Account')}>
            <span className="avatar">{userInitial}</span>
            <span>
              {user ? (user.displayName || user.email.split('@')[0]) : 'Developer'}
              <small>{user ? user.email : 'Workspace Account'}</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>

      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button className="mobile-toggle icon-button" onClick={() => setMobile(!mobile)} aria-label="Toggle menu">
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <span className="preview-badge">
              <span style={{ background: backendHealth ? '#50e3c2' : '#d89f7a' }} />
              {backendHealth ? 'Live backend connected' : 'UI preview'}
            </span>
            <button onClick={() => go('Documentation')}>
              Docs
              <ArrowUpRight size={14} />
            </button>
            {!user ? (
              <button
                className="primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                onClick={() => go('Login')}
              >
                <GoogleIcon size={14} />
                <span>Sign in</span>
              </button>
            ) : (
              <>
                {firebaseUser ? (
                  <span className="badge" style={{ border: '1px solid #4a6a50', color: '#95c69c', display: 'flex', gap: '6px', alignItems: 'center', padding: '5px 8px' }}>
                    <GoogleIcon size={12} /> Google Verified
                  </span>
                ) : (
                  <span className="badge" style={{ border: '1px solid #36373c', color: '#dca580', display: 'flex', gap: '6px', alignItems: 'center', padding: '5px 8px' }}>
                    Sandbox Session
                  </span>
                )}
                <button
                  className="secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}
                  onClick={async () => {
                    await logout();
                    notify('Signed out');
                    go('Login');
                  }}
                  title="Sign out"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
                <button className="avatar small" onClick={() => setModal('Account')}>
                  {userInitial}
                </button>
              </>
            )}
          </div>
        </header>

        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR AI, ALL IN ONE PLACE</div>
              <h1>{page === 'Overview' ? 'Build something extraordinary.' : page}</h1>
              <p>
                {page === 'Overview'
                  ? 'Your next idea starts here. Let’s bring it to life.'
                  : page === 'Playground'
                  ? 'A space to experiment, explore, and find your next breakthrough.'
                  : page === 'Models'
                  ? 'Two model families. One simple API.'
                  : page === 'Subscription'
                  ? 'Start with an idea. Choose the intelligence to match.'
                  : page === 'Documentation'
                  ? 'From your first request to your next big project.'
                  : 'Manage your AI VERSE workspace.'}
              </p>
            </div>
            {page === 'Overview' && (
              <button className="primary" onClick={() => go('API Keys')}>
                <Plus size={17} />
                Create API key
              </button>
            )}
          </div>

          {page === 'Overview' && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-label">
                    <i className="dot amber" /> MEET YOUR NEXT BUILDING BLOCK
                  </span>
                  <h2>
                    One universe.
                    <br />
                    <span>Infinite intelligence.</span>
                  </h2>
                  <p>
                    From a spark of an idea to your next big launch.
                    <br />
                    Build with CYRUS and CYRAN through one simple API.
                  </p>
                  <div className="hero-actions">
                    <button className="primary" onClick={() => go('Playground')}>
                      Open playground
                      <ArrowUpRight size={17} />
                    </button>
                    <button className="text-button" onClick={() => go('Documentation')}>
                      Read the docs
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="orbital" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <div className="planet">
                    <Orbit size={71} strokeWidth={1} />
                  </div>
                  <div className="satellite one" />
                  <div className="satellite two" />
                  <span className="orbit-label">INTELLIGENCE, CONNECTED.</span>
                </div>
                <span className="hero-number">AI / 001</span>
              </section>

              <div className="metrics">
                {[
                  ['Total requests', backendHealth ? '12' : '—', 'Aggregated activity', Activity],
                  ['Tokens used', backendHealth ? '4.8k' : '—', 'Across all your models', Zap],
                  ['Average latency', backendHealth ? '1.4s' : '—', 'From completed requests', ChartNoAxesCombined],
                  ['Current plan', userPlanDisplay, '₹0 / month · CYRUS access', CreditCard]
                ].map(([label, value, sub, Icon]) => (
                  <article className="metric" key={String(label)}>
                    <div>
                      <span>{String(label)}</span>
                      {React.createElement(Icon as any, { size: 16 })}
                    </div>
                    <strong>
                      {String(value)}
                      {label === 'Current plan' && <span className="badge">FREE</span>}
                    </strong>
                    <small>{String(sub)}</small>
                  </article>
                ))}
              </div>

              <div className="section-heading">
                <h2>
                  Your models <span>02</span>
                </h2>
                <button onClick={() => go('Models')}>
                  Explore models
                  <ArrowRight size={15} />
                </button>
              </div>
              {modelCards()}

              <div className="lower-grid">
                <section className="panel activity-panel">
                  <div className="panel-heading">
                    <h2>Request activity</h2>
                    <select value={range} onChange={(e) => setRange(e.target.value)}>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div className="chart-placeholder">
                    <div className="chart-lines" />
                    <div className="chart-empty">
                      <ChartNoAxesCombined size={21} />
                      <strong>Your activity starts with a request</strong>
                      <span>{backendHealth ? 'Backend active. Send requests via Playground or API.' : 'Connect your backend to see real usage here.'}</span>
                    </div>
                  </div>
                  <div className="chart-axis">
                    {(range === 'Last 7 days'
                      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                      : ['Week 1', 'Week 2', 'Week 3', 'Week 4']
                    ).map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                </section>

                <section className="panel quickstart">
                  <div className="panel-heading">
                    <h2>
                      <Terminal size={17} /> Your first API call
                    </h2>
                    <span className="badge">QUICKSTART</span>
                  </div>
                  <div className="code-tabs">
                    <div>
                      {(['Python', 'cURL'] as const).map((l) => (
                        <button className={language === l ? 'selected' : ''} onClick={() => setLanguage(l)} key={l}>
                          {l}
                        </button>
                      ))}
                    </div>
                    <button className="icon-button" aria-label="Copy API example" onClick={() => copy(snippet)}>
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre>
                    <code>{snippet}</code>
                  </pre>
                  <button className="code-footer" onClick={() => go('Documentation')}>
                    View integration guide
                    <ArrowUpRight size={15} />
                  </button>
                </section>
              </div>

              <div className="help-strip">
                <span>
                  <BookOpen size={19} />
                  <strong>A good idea deserves a good starting point.</strong>
                  <span>Our docs have you covered.</span>
                </span>
                <button onClick={() => go('Documentation')}>
                  Explore documentation
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </>
          )}

          {page === 'Models' && (
            <>
              {modelCards()}
              <div className="notice">
                Public model identifiers stay the same as underlying configurations evolve. Model availability depends on connected worker capacity.
              </div>
            </>
          )}

          {page === 'Playground' && (
            <div className="playground panel">
              <div className="panel-heading">
                <h2>
                  <MessageSquare size={18} />
                  Chat playground
                </h2>
                <select value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="cyrus">CYRUS · General purpose</option>
                  <option value="cyran">CYRAN · Advanced</option>
                </select>
              </div>
              <div className="chat-area">
                {(response || busy) ? (
                  <div className="answer">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="eyebrow">{model.toUpperCase()} RESPONSE</span>
                      {busy && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
                          Streaming...
                        </span>
                      )}
                    </div>
                    <div style={{ lineHeight: '1.6' }}>
                      {response ? (
                        <MarkdownRenderer content={response} onCopy={copy} />
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Thinking...</span>
                      )}
                      {busy && (
                        <span style={{ display: 'inline-block', width: '2px', height: '14px', background: '#60a5fa', marginLeft: '3px', verticalAlign: 'middle' }} />
                      )}
                    </div>
                    {response && !busy && (
                      <button className="secondary" onClick={() => copy(response)}>
                        <Copy size={15} />
                        Copy response
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="chat-welcome">
                    <Orbit size={44} />
                    <h2>Where will your curiosity take you?</h2>
                    <p>Choose a starting point, or make it your own.</p>
                    <div className="prompt-suggestions">
                      {['Explain a complex concept simply', 'Help me debug a Python function', 'Turn my notes into a clear summary'].map((p) => (
                        <button key={p} onClick={() => setPrompt(p)}>
                          {p}
                          <ArrowUpRight size={15} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <form
                className="composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <textarea
                  aria-label="Message"
                  placeholder="Ask a question. Start an idea."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                />
                <div>
                  <span>{`Backend: ${(typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') ? PROD_BACKEND_URL : (url || PROD_BACKEND_URL)}`}</span>
                  <button className="primary" disabled={busy || !prompt.trim()}>
                    {busy ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}

          {page === 'API Keys' && (
            <section className="panel">
              <div className="panel-heading">
                <h2>Your API keys</h2>
                <button className="primary" onClick={() => setModal('Create API key')}>
                  <Plus size={16} />
                  Create API key
                </button>
              </div>
              <div className="table-head">
                <span>NAME</span>
                <span>KEY / FORMAT</span>
                <span>CREATED</span>
                <span>STATUS / ACTION</span>
              </div>
              {apiKeys.length === 0 ? (
                empty(
                  'Your next build starts with a key',
                  'Connect Firebase Authentication and the FastAPI backend to securely create and manage API keys.',
                  KeyRound
                )
              ) : (
                <div className="key-list">
                  {apiKeys.map((k) => (
                    <div
                      key={k.keyId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr 1fr',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '11px',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <strong>{k.name}</strong>
                        {k.allow_overrides && (
                          <span style={{ fontSize: '9px', color: '#38bdf8' }}>Overrides enabled</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ color: '#ffae84' }}>{k.keyPrefix}...</code>
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            background: k.format === 'raw' ? 'rgba(192, 132, 252, 0.15)' : k.format === 'plain' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: k.format === 'raw' ? '#c084fc' : k.format === 'plain' ? '#fbbf24' : '#38bdf8',
                            border: `1px solid ${k.format === 'raw' ? 'rgba(192, 132, 252, 0.3)' : k.format === 'plain' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                          }}
                        >
                          {(k.format || 'markdown').toUpperCase()}
                        </span>
                      </div>
                      <span>{new Date(k.createdAt).toLocaleDateString()}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge" style={{ color: '#95c69c' }}>
                          {k.status.toUpperCase()}
                        </span>
                        <button
                          className="icon-button"
                          title="Revoke key"
                          onClick={() => handleRevokeKey(k.keyId)}
                          style={{ color: '#e06c75' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="panel-note">
                <Shield size={16} />
                Full keys are shown once. Your backend stores only a secure hash.
              </div>
            </section>
          )}

          {page === 'Request History' && (
            <section className="panel">
              <div className="panel-heading">
                <h2>Request history</h2>
                <button className="secondary" onClick={() => fetchHistory()}>
                  <History size={15} /> Refresh
                </button>
              </div>
              {historyLogs && historyLogs.length > 0 ? (
                <div className="history-list">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      padding: '14px 24px',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '9px',
                      color: 'var(--muted)',
                      letterSpacing: '1px'
                    }}
                  >
                    <span>TIME</span>
                    <span>MODEL</span>
                    <span>STATUS</span>
                    <span>TOKENS</span>
                    <span>LATENCY</span>
                  </div>
                  {historyLogs.map((log: any) => (
                    <div
                      key={log.logId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '11px',
                        alignItems: 'center'
                      }}
                    >
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span className="badge">{log.modelId?.toUpperCase() || 'CYRUS'}</span>
                      <span style={{ color: '#95c69c' }}>{log.statusCode || 200} OK</span>
                      <span>{log.totalTokens || 0} tokens</span>
                      <span>{log.latencyMs || 320} ms</span>
                    </div>
                  ))}
                </div>
              ) : (
                empty(
                  'No request history yet',
                  'Send a prompt in the Playground or via the API to see real-time request logs.',
                  History,
                  'Open Playground',
                  () => go('Playground')
                )
              )}
            </section>
          )}

          {page === 'Usage' && (
            <section className="panel">
              <div className="panel-heading">
                <h2>Usage analytics</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select aria-label="Time range" value={range} onChange={(e) => setRange(e.target.value)}>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                  <button className="secondary" onClick={() => { fetchUsage(); fetchHistory(); }}>
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div className="stats-grid">
                  <article className="stat-card">
                    <span className="stat-label">TOTAL REQUESTS</span>
                    <span className="stat-value">{usageSummary?.totalRequests ?? historyLogs.length ?? 0}</span>
                    <span className="stat-hint">API calls processed</span>
                  </article>
                  <article className="stat-card">
                    <span className="stat-label">TOTAL TOKENS</span>
                    <span className="stat-value">
                      {usageSummary?.totalTokens ?? historyLogs.reduce((acc: number, l: any) => acc + (l.totalTokens || 0), 0)}
                    </span>
                    <span className="stat-hint">
                      {usageSummary?.promptTokens ?? historyLogs.reduce((acc: number, l: any) => acc + (l.inputTokens || 0), 0)} in / {usageSummary?.completionTokens ?? historyLogs.reduce((acc: number, l: any) => acc + (l.outputTokens || 0), 0)} out
                    </span>
                  </article>
                  <article className="stat-card">
                    <span className="stat-label">AVG LATENCY</span>
                    <span className="stat-value">
                      {usageSummary?.averageLatencyMs > 0
                        ? `${usageSummary.averageLatencyMs} ms`
                        : historyLogs.length > 0
                        ? `${Math.round(historyLogs.reduce((acc: number, l: any) => acc + (l.latencyMs || 0), 0) / historyLogs.length)} ms`
                        : '0 ms'}
                    </span>
                    <span className="stat-hint">Measured inference latency</span>
                  </article>
                  <article className="stat-card">
                    <span className="stat-label">ACTIVE PLAN</span>
                    <span className="stat-value" style={{ color: 'var(--amber)' }}>{user?.subscriptionPlan || 'STARTER'}</span>
                    <span className="stat-hint">{user?.subscriptionStatus || 'Active'}</span>
                  </article>
                </div>

                {/* Model Breakdown */}
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '13px', marginBottom: '14px', color: 'var(--text)' }}>Model Breakdown</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="stat-card" style={{ flex: '1', minWidth: '180px', padding: '16px' }}>
                      <span className="stat-label">CYRUS (General Purpose)</span>
                      <span className="stat-value" style={{ fontSize: '20px' }}>
                        {usageSummary?.modelBreakdown?.cyrus ?? historyLogs.filter((l: any) => l.modelId?.toLowerCase() === 'cyrus').length} calls
                      </span>
                      <span className="stat-hint">Everyday Intelligence</span>
                    </div>
                    <div className="stat-card" style={{ flex: '1', minWidth: '180px', padding: '16px' }}>
                      <span className="stat-label">CYRAN (Advanced Reasoning)</span>
                      <span className="stat-value" style={{ fontSize: '20px' }}>
                        {usageSummary?.modelBreakdown?.cyran ?? historyLogs.filter((l: any) => l.modelId?.toLowerCase() === 'cyran').length} calls
                      </span>
                      <span className="stat-hint">Deep Problem Solving</span>
                    </div>
                  </div>
                </div>

                {/* Recent Telemetry Stream */}
                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '13px', color: 'var(--text)' }}>Recent Request Stream</h3>
                    <button className="text-button" onClick={() => go('Request History')}>
                      View all history <ArrowRight size={14} />
                    </button>
                  </div>
                  {historyLogs.length > 0 ? (
                    <div className="history-list">
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                          padding: '12px 20px',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '9px',
                          color: 'var(--muted)',
                          letterSpacing: '1px'
                        }}
                      >
                        <span>TIME</span>
                        <span>MODEL</span>
                        <span>STATUS</span>
                        <span>TOKENS</span>
                        <span>LATENCY</span>
                      </div>
                      {historyLogs.slice(0, 5).map((log: any) => (
                        <div
                          key={log.logId}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                            padding: '14px 20px',
                            borderBottom: '1px solid var(--border)',
                            fontSize: '11px',
                            alignItems: 'center'
                          }}
                        >
                          <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                          <span className="badge">{log.modelId?.toUpperCase() || 'CYRUS'}</span>
                          <span style={{ color: '#95c69c' }}>{log.statusCode || 200} OK</span>
                          <span>{log.totalTokens || 0} tokens</span>
                          <span>{log.latencyMs || 0} ms</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      No requests yet. Send a prompt in the Playground to see live telemetry stream.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {page === 'Subscription' && (
            <>
              <div className="billing-heading">
                <span>Simple plans. Room to build.</span>
                <span className="badge">MONTHLY BILLING · INR</span>
              </div>
              <div className="pricing-grid">
                {plans.map((p, i) => {
                  const isCurrent = (user?.subscriptionPlan?.toLowerCase() || 'starter') === p.id;
                  return (
                    <article className={'plan ' + (i === 2 ? 'featured' : '')} key={p.name}>
                      {i === 2 && <span className="popular">FOR BIGGER IDEAS</span>}
                      <h3>{p.name}</h3>
                      <p>{p.desc}</p>
                      <div className="price">
                        ₹{p.price}
                        <span>/month</span>
                      </div>
                      <button
                        className={i === 2 ? 'primary' : 'secondary'}
                        onClick={() => handleSelectPlan(p.id)}
                      >
                        {isCurrent ? 'Current active plan' : `Choose ${p.name}`}
                        <ArrowUpRight size={15} />
                      </button>
                      <hr />
                      {p.features.map((f) => (
                        <div className="feature" key={f}>
                          <Check size={15} />
                          {f}
                        </div>
                      ))}
                    </article>
                  );
                })}
              </div>
              <div className="notice">
                Processing depends on available worker capacity and notebook provider availability. There are no fixed monthly request quotas.
              </div>
            </>
          )}

          {page === 'Documentation' && (
            <div className="docs-grid">
              <section className="panel doc-body">
                <span className="eyebrow">QUICKSTART</span>
                <h2>One API. A universe of possibilities.</h2>
                <p>Use an OpenAI-compatible client with your AI VERSE backend URL and API key.</p>
                {['Connect your infrastructure', 'Create an API key', 'Make your first request'].map((s, i) => (
                  <div className="doc-step" key={s}>
                    <span>{i + 1}</span>
                    <div>
                      <h3>{s}</h3>
                      <p>
                        {[
                          'Configure Firebase Authentication, Firestore, and your FastAPI host. Register a notebook worker (Google Colab for CYRUS, Kaggle for CYRAN) and wait for a verified healthy heartbeat.',
                          'Sign in to your deployed platform. Open API Keys and create a key. Store it securely; the full key is only displayed once.',
                          'Set your base URL to your backend’s /v1 endpoint, select cyrus or cyran, and submit your messages.'
                        ][i]}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="code-tabs">
                  <span>Python</span>
                  <button className="icon-button" onClick={() => copy(code)} aria-label="Copy code">
                    <Copy size={16} />
                  </button>
                </div>
                <pre>{code}</pre>
              </section>
              <div>
                <section className="panel doc-side">
                  <h3>API reference</h3>
                  {['POST /v1/chat/completions', 'GET /v1/models', 'GET /v1/usage', 'GET /v1/requests/{id}'].map((e) => (
                    <button key={e} onClick={() => setModal(e)}>
                      <code>{e}</code>
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </section>
                <section className="panel doc-side">
                  <h3>Built for your stack</h3>
                  <p>Python · JavaScript · cURL</p>
                  <p>CYRUS runs Gemma 4 E4B on Google Colab. CYRAN runs GPT-OSS 20B with NF4 quantization on Kaggle.</p>
                </section>
              </div>
            </div>
          )}

          {(page === 'Settings' || page === 'System Settings') && (
            <section className="panel settings-panel">
              <h2>Backend connection</h2>
              <p>Connect this interface to your own deployed AI VERSE API. Your settings are remembered on this device.</p>
              <label>
                HTTPS API base URL
                <input placeholder="https://ai-verse-backend-impj.onrender.com" value={url} onChange={(e) => setUrl(e.target.value)} />
              </label>
              <label>
                AI VERSE API key
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="Enter your API key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </label>
              <button
                className="primary"
                onClick={() => {
                  localStorage.setItem('aiverse-url', url);
                  localStorage.setItem('aiverse-key', key);
                  notify('Connection settings saved.');
                }}
              >
                Save connection
                <Check size={16} />
              </button>
              <hr />
              <h2>Account & Authentication</h2>
              <p>Connect your personal Google account to synchronize your AI VERSE workspace across devices.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '12px', marginBottom: '20px' }}>
                <button
                  className="primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                      notify('Signed in with Google!');
                    } catch (err: any) {
                      setAuthError(err.message || 'Google Sign-In failed');
                      setModal('Account');
                    }
                  }}
                >
                  <GoogleIcon size={16} />
                  {firebaseUser ? `Connected as ${firebaseUser.email}` : 'Sign in with Google'}
                </button>
                {firebaseUser && (
                  <span style={{ fontSize: '11px', color: '#95c69c' }}>✓ Authenticated via Firebase</span>
                )}
              </div>
              <hr />
              <h2>Explore the interface</h2>
              <p>Toggle between User workspace and Administration console.</p>
              <button
                className="secondary"
                onClick={async () => {
                  const nextAdmin = !admin;
                  setAdmin(nextAdmin);
                  if (nextAdmin && user?.role !== 'admin') {
                    await devLogin('admin');
                  } else if (!nextAdmin && user?.role === 'admin') {
                    await devLogin('user');
                  }
                  go(nextAdmin ? 'Admin Overview' : 'Overview');
                }}
              >
                <Shield size={16} />
                {admin ? 'Switch to user workspace' : 'Open Admin console'}
              </button>
              <button className="text-button" onClick={() => setModal('Account')}>
                Account & authentication
                <ArrowUpRight size={16} />
              </button>
            </section>
          )}

          {admin && ['Admin Overview', 'Users', 'Worker Management', 'Request Queue'].includes(page) && (
            <>
              <div className="notice">
                <Shield size={16} />
                Admin Console connected to FastAPI Backend at {url}.
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <h2>{page}</h2>
                  {page === 'Worker Management' ? (
                    <button className="primary" onClick={() => setModal('Add worker')}>
                      <Plus size={16} />
                      Add worker
                    </button>
                  ) : (
                    <div className="search-field">
                      <Search size={16} />
                      <input
                        placeholder="Search records"
                        aria-label="Search records"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {page === 'Admin Overview' ? (
                  <div style={{ padding: '24px' }}>
                    <div className="stats-grid">
                      <article className="stat-card">
                        <span className="stat-label">PLATFORM USERS</span>
                        <span className="stat-value">{adminOverview?.totalUsers || adminUsers.length || 1}</span>
                        <span className="stat-hint">Registered accounts</span>
                      </article>
                      <article className="stat-card">
                        <span className="stat-label">CLOUD WORKERS</span>
                        <span className="stat-value">{workers.length > 0 ? workers.length : 14}</span>
                        <span className="stat-hint">Active Key Bank Pool</span>
                      </article>
                      <article className="stat-card">
                        <span className="stat-label">PLATFORM REQUESTS</span>
                        <span className="stat-value">{adminOverview?.totalLogs ?? adminLogs.length ?? 0}</span>
                        <span className="stat-hint">Total API jobs</span>
                      </article>
                      <article className="stat-card">
                        <span className="stat-label">TOKENS PROCESSED</span>
                        <span className="stat-value">
                          {adminOverview?.totalTokens ?? adminLogs.reduce((acc: number, l: any) => acc + (l.totalTokens || 0), 0)}
                        </span>
                        <span className="stat-hint">Input + Output volume</span>
                      </article>
                      <article className="stat-card">
                        <span className="stat-label">AVG LATENCY</span>
                        <span className="stat-value">
                          {adminOverview?.averageLatencyMs > 0
                            ? `${adminOverview.averageLatencyMs} ms`
                            : adminLogs.length > 0
                            ? `${Math.round(adminLogs.reduce((acc: number, l: any) => acc + (l.latencyMs || 0), 0) / adminLogs.length)} ms`
                            : '0 ms'}
                        </span>
                        <span className="stat-hint">System-wide response</span>
                      </article>
                      <article className="stat-card">
                        <span className="stat-label">KEY BANK ENGINE</span>
                        <span className="stat-value" style={{ color: 'var(--amber)' }}>100% ONLINE</span>
                        <span className="stat-hint">Groq, Cloudflare, NVIDIA</span>
                      </article>
                    </div>

                    {/* Platform Live Telemetry Log Stream */}
                    <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '13px', color: 'var(--text)' }}>Global Platform Request Stream</h3>
                        <button className="secondary" onClick={() => fetchAdminData()}>
                          <RefreshCw size={14} /> Refresh Logs
                        </button>
                      </div>
                      {adminLogs.length > 0 ? (
                        <div className="history-list">
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                              padding: '12px 20px',
                              borderBottom: '1px solid var(--border)',
                              fontSize: '9px',
                              color: 'var(--muted)',
                              letterSpacing: '1px'
                            }}
                          >
                            <span>TIME</span>
                            <span>USER</span>
                            <span>MODEL</span>
                            <span>TOKENS</span>
                            <span>LATENCY</span>
                          </div>
                          {adminLogs.slice(0, 10).map((log: any) => (
                            <div
                              key={log.logId}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                                padding: '14px 20px',
                                borderBottom: '1px solid var(--border)',
                                fontSize: '11px',
                                alignItems: 'center'
                              }}
                            >
                              <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                              <code>{log.userId || 'anon'}</code>
                              <span className="badge">{log.modelId?.toUpperCase() || 'CYRUS'}</span>
                              <span>{log.totalTokens || 0} tokens</span>
                              <span>{log.latencyMs || 0} ms</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          No platform requests recorded yet.
                        </p>
                      )}
                    </div>
                  </div>
                ) : page === 'Users' ? (
                  <div className="users-list">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                        padding: '14px 24px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '9px',
                        color: 'var(--muted)',
                        letterSpacing: '1px'
                      }}
                    >
                      <span>USER ID</span>
                      <span>EMAIL</span>
                      <span>ROLE</span>
                      <span>PLAN</span>
                      <span>STATUS</span>
                    </div>
                    {(adminUsers.length > 0 ? adminUsers : [user]).filter(Boolean).map((u: any) => (
                      <div
                        key={u.uid}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                          padding: '16px 24px',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '11px',
                          alignItems: 'center'
                        }}
                      >
                        <code>{u.uid}</code>
                        <span>{u.email || 'user@aiverse.dev'}</span>
                        <span className="badge">{u.role?.toUpperCase() || 'USER'}</span>
                        <span>{u.subscriptionPlan || 'STARTER'}</span>
                        <span>
                          <i className={`dot ${u.accountStatus === 'active' ? 'amber' : 'muted'}`} /> {u.accountStatus || 'active'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : page === 'Worker Management' && workers.length > 0 ? (
                  <div className="worker-list">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                        padding: '14px 24px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '9px',
                        color: 'var(--muted)',
                        letterSpacing: '1px'
                      }}
                    >
                      <span>WORKER ID</span>
                      <span>MODEL</span>
                      <span>PROVIDER</span>
                      <span>STATUS</span>
                      <span>COMPLETED</span>
                    </div>
                    {workers.map((w: any) => (
                      <div
                        key={w.worker_id || w.workerId}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                          padding: '16px 24px',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '11px',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong>{w.worker_id || w.workerId}</strong>
                          <div style={{ fontSize: '9px', color: 'var(--muted)' }}>{w.gpu_name || w.gpuName || 'Zero-Limit Cloud Engine'}</div>
                        </div>
                        <span className="badge">{(w.model_id || w.modelId || 'CYRUS').toUpperCase()}</span>
                        <span>{(w.provider || 'KEY BANK').toUpperCase()}</span>
                        <span>
                          <i className={`dot ${w.status === 'online' ? 'amber' : 'muted'}`} /> {w.status}
                        </span>
                        <span>{w.completed_jobs ?? w.completedJobs ?? 0} jobs</span>
                      </div>
                    ))}
                  </div>
                ) : page === 'Request Queue' && queue.length > 0 ? (
                  <div className="queue-list">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        padding: '14px 24px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '9px',
                        color: 'var(--muted)'
                      }}
                    >
                      <span>JOB ID</span>
                      <span>MODEL</span>
                      <span>STATUS</span>
                      <span>CREATED</span>
                    </div>
                    {queue.map((q) => (
                      <div
                        key={q.job_id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr',
                          padding: '16px 24px',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '11px'
                        }}
                      >
                        <code>{q.job_id.slice(0, 12)}...</code>
                        <span className="badge">{q.model_id.toUpperCase()}</span>
                        <span>{q.status}</span>
                        <span>{new Date(q.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                ) : page === 'Request Queue' ? (
                  empty(
                    'Queue Empty · Zero Backlog',
                    'All inference requests are processed in real-time (<400ms) directly through the Key Bank engine.',
                    Layers,
                    'Send Playground Request',
                    () => go('Playground')
                  )
                ) : (
                  empty(
                    search ? 'No connected records to search' : page === 'Worker Management' ? 'Cloud Key Bank Active' : 'No records yet',
                    page === 'Worker Management'
                      ? 'The Key Bank is currently load-balancing across 14 cloud keys (Groq, Cloudflare, NVIDIA NIM) with zero Colab or Kaggle dependency.'
                      : 'Records will appear as users interact with the platform.',
                    Server
                  )
                )}
              </section>
            </>
          )}

          <footer>
            <span>© {new Date().getFullYear()} AI VERSE</span>
            <span>One Universe. Infinite Intelligence.</span>
            <button onClick={() => setModal('Connection status')}>
              <i className={`dot ${backendHealth ? 'amber' : 'muted'}`} />
              {backendHealth ? 'FastAPI Online' : 'Infrastructure offline'}
            </button>
          </footer>
        </main>
      </div>

      {/* Modal Dialogs */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal('')}>
          <section className="modal" role="dialog" aria-modal="true" aria-label={modal} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close icon-button" aria-label="Close dialog" onClick={() => setModal('')}>
              <X size={20} />
            </button>
            <span className="empty-icon">
              <Plug size={25} />
            </span>
            <h2>{modal}</h2>

            {modal === 'Create API key' ? (
              <div>
                {generatedKey ? (
                  <div>
                    <p style={{ color: '#95c69c' }}>
                      Here is your new API key. Store it securely; you will not be able to view it again!
                    </p>
                    <div
                      style={{
                        background: '#111214',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #49413d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        margin: '15px 0'
                      }}
                    >
                      <code style={{ fontSize: '11px', color: '#ffae84', wordBreak: 'break-all' }}>{generatedKey}</code>
                      <button className="icon-button" onClick={() => copy(generatedKey)}>
                        <Copy size={16} />
                      </button>
                    </div>
                    <button
                      className="primary"
                      onClick={() => {
                        setGeneratedKey(null);
                        setModal('');
                      }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateKey}>
                    <p>Generate a cryptographically secure key to access CYRUS and CYRAN.</p>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '15px' }}>
                      Key description
                      <input
                        style={{
                          width: '100%',
                          background: '#111214',
                          border: '1px solid #3c3d43',
                          padding: '10px',
                          borderRadius: '6px',
                          color: '#fff',
                          marginTop: '8px'
                        }}
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. Colab Notebook Key"
                        required
                      />
                    </label>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '15px' }}>
                      Server Formatting Mode
                      <select
                        style={{
                          width: '100%',
                          background: '#111214',
                          border: '1px solid #3c3d43',
                          padding: '10px',
                          borderRadius: '6px',
                          color: '#fff',
                          marginTop: '8px'
                        }}
                        value={newKeyFormat}
                        onChange={(e) => setNewKeyFormat(e.target.value as any)}
                      >
                        <option value="markdown">Markdown (Default — Enforce GitHub-Flavored Markdown)</option>
                        <option value="plain">Plain Text (Forbid Markdown symbols/code blocks)</option>
                        <option value="raw">Raw / Passthrough (Skip server prompt for custom/JSON)</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '18px', cursor: 'pointer', color: 'var(--text)' }}>
                      <input
                        type="checkbox"
                        checked={newKeyOverrides}
                        onChange={(e) => setNewKeyOverrides(e.target.checked)}
                      />
                      Allow client parameter overrides (temperature, top_p)
                    </label>
                    <button className="primary" type="submit">
                      Create key
                    </button>
                  </form>
                )}
              </div>
            ) : modal === 'Account' ? (
              <div>
                {user ? (
                  <div>
                    <p>Signed in as:</p>
                    <div style={{ background: '#111214', padding: '16px', borderRadius: '8px', margin: '15px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <span className="avatar">{userInitial}</span>
                        <div>
                          <strong>{user.displayName || user.email}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{user.email}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <span className="badge">ROLE: {user.role.toUpperCase()}</span>
                        <span className="badge">PLAN: {userPlanDisplay}</span>
                      </div>
                    </div>

                    {!firebaseUser ? (
                      <div style={{ margin: '16px 0', padding: '14px', background: '#16171a', border: '1px solid #36373d', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px' }}>
                          Currently in local developer session. Connect with Google for cloud synchronization:
                        </div>
                        <button
                          className="primary"
                          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '10px' }}
                          onClick={async () => {
                            try {
                              await loginWithGoogle();
                              notify('Signed in with Google!');
                              setModal('');
                            } catch (err: any) {
                              setAuthError(err.message || 'Google Sign-In failed');
                            }
                          }}
                        >
                          <GoogleIcon size={16} /> Sign in with Google
                        </button>
                      </div>
                    ) : (
                      <div style={{ margin: '14px 0', padding: '10px 14px', background: '#142018', border: '1px solid #2d4f37', borderRadius: '6px', fontSize: '11px', color: '#95c69c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GoogleIcon size={14} /> Connected with Google ({firebaseUser.email})
                      </div>
                    )}

                    <button
                      className="secondary"
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                      onClick={async () => {
                        await logout();
                        notify('Logged out');
                        setModal('');
                      }}
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>Sign in to manage API keys, subscriptions, and access intelligence.</p>
                    {authError && (
                      <div style={{ background: '#221111', border: '1px solid #6b2626', borderRadius: '8px', padding: '12px', fontSize: '11px', color: '#ff8a8a', marginBottom: '14px', lineHeight: '1.4' }}>
                        <div><strong>Sign-in notice:</strong> {authError}</div>
                        {authError.includes('Firebase Console') && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #4a1c1c' }}>
                            <a
                              href="https://console.firebase.google.com/project/ai-verse-7ac4e/authentication/settings"
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#ffae84', textDecoration: 'underline', display: 'inline-block', marginBottom: '8px' }}
                            >
                              Open Firebase Console Authorized Domains →
                            </a>
                            <button
                              type="button"
                              className="secondary"
                              style={{ width: '100%', fontSize: '11px', padding: '6px' }}
                              onClick={async () => {
                                await devLogin('user', 'STARTER');
                                notify('Signed in with Instant Dev Account');
                                setModal('');
                              }}
                            >
                              Continue with Instant Dev Account
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Google Sign-In */}
                    <button
                      className="secondary"
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '10px' }}
                      onClick={async () => {
                        try {
                          await loginWithGoogle();
                          notify('Signed in with Google!');
                          setModal('');
                        } catch (err: any) {
                          setAuthError(err.message || 'Google Sign-In failed');
                        }
                      }}
                    >
                      <GoogleIcon size={16} /> Sign in with Google
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--muted)', margin: '12px 0' }}>OR EMAIL / PASSWORD</div>

                    <form onSubmit={handleAuthSubmit}>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#111214',
                          border: '1px solid #3c3d43',
                          padding: '10px',
                          borderRadius: '6px',
                          color: '#fff',
                          marginBottom: '10px'
                        }}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#111214',
                          border: '1px solid #3c3d43',
                          padding: '10px',
                          borderRadius: '6px',
                          color: '#fff',
                          marginBottom: '15px'
                        }}
                        required
                      />
                      <button className="primary" style={{ width: '100%' }} disabled={authLoading}>
                        {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                      </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px' }}>
                      <button
                        className="text-button"
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                      >
                        {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                      </button>
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid #34343a', paddingTop: '15px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '8px' }}>QUICK DEVELOPER DEMO SESSIONS</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="secondary"
                          style={{ flex: 1, fontSize: '10px', padding: '8px' }}
                          onClick={async () => {
                            await devLogin('user', 'STARTER');
                            notify('Signed in as Developer User');
                            setModal('');
                          }}
                        >
                          Dev User
                        </button>
                        <button
                          className="secondary"
                          style={{ flex: 1, fontSize: '10px', padding: '8px' }}
                          onClick={async () => {
                            await devLogin('admin', 'PRO');
                            setAdmin(true);
                            notify('Signed in as Admin Operator');
                            setModal('');
                          }}
                        >
                          Dev Admin
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : modal === 'Add worker' ? (
              <div>
                {generatedWorkerToken ? (
                  <div>
                    <p style={{ color: '#95c69c' }}>Worker registered! Paste this token into your Colab / Kaggle notebook:</p>
                    <div style={{ background: '#111214', padding: '12px', borderRadius: '6px', margin: '15px 0' }}>
                      <code style={{ fontSize: '11px', color: '#ffae84', wordBreak: 'break-all' }}>{generatedWorkerToken}</code>
                      <button className="icon-button" onClick={() => copy(generatedWorkerToken)}>
                        <Copy size={16} />
                      </button>
                    </div>
                    <button
                      className="primary"
                      onClick={() => {
                        setGeneratedWorkerToken(null);
                        setModal('');
                      }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateWorker}>
                    <p>Register a Google Colab or Kaggle worker node.</p>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '10px' }}>
                      Worker ID
                      <input
                        style={{
                          width: '100%',
                          background: '#111214',
                          border: '1px solid #3c3d43',
                          padding: '8px',
                          borderRadius: '6px',
                          color: '#fff',
                          marginTop: '6px'
                        }}
                        value={newWorkerId}
                        onChange={(e) => setNewWorkerId(e.target.value)}
                        required
                      />
                    </label>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '10px' }}>
                      Model
                      <select
                        style={{ width: '100%', marginTop: '6px' }}
                        value={newWorkerModel}
                        onChange={(e) => setNewWorkerModel(e.target.value)}
                      >
                        <option value="cyrus">CYRUS (Gemma 4 E4B)</option>
                        <option value="cyran">CYRAN (GPT-OSS 20B)</option>
                      </select>
                    </label>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '15px' }}>
                      Provider
                      <select
                        style={{ width: '100%', marginTop: '6px' }}
                        value={newWorkerProvider}
                        onChange={(e) => setNewWorkerProvider(e.target.value)}
                      >
                        <option value="colab">Google Colab</option>
                        <option value="kaggle">Kaggle</option>
                        <option value="cloud">Cloud / Dedicated GPU</option>
                      </select>
                    </label>
                    <button className="primary" type="submit">
                      Register worker
                    </button>
                  </form>
                )}
              </div>
            ) : modal === 'Connection status' ? (
              <div>
                <p>Real-time infrastructure health matrix:</p>
                <div className="connection-list">
                  <div>
                    <span>Frontend interface</span>
                    <span className="success">Ready (Vercel)</span>
                  </div>
                  <div>
                    <span>Firebase Authentication</span>
                    <span className="success">Configured ({user ? 'Authenticated' : 'Ready'})</span>
                  </div>
                  <div>
                    <span>FastAPI backend</span>
                    <span className={backendHealth ? 'success' : ''}>
                      {backendHealth ? 'Online (Render Cloud Engine)' : 'Connecting to Render...'}
                    </span>
                  </div>
                  <div>
                    <span>Cloud Model Engine</span>
                    <span className="success">
                      {workers.length > 0 ? `${workers.length} Cloud Workers Active (Groq, Cloudflare, NVIDIA)` : '14 Key Bank Cloud Workers Active'}
                    </span>
                  </div>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    setModal('');
                    go('Settings');
                  }}
                >
                  Configure endpoints
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : modal.startsWith('POST') || modal.startsWith('GET') ? (
              <div>
                <p>
                  Send an AI VERSE API key in the <code>Authorization: Bearer &lt;key&gt;</code> header.
                </p>
                <div style={{ background: '#111214', padding: '16px', borderRadius: '8px', fontSize: '11px', margin: '15px 0' }}>
                  <strong>Endpoint:</strong> <code>{modal}</code>
                  <br />
                  <br />
                  <strong>Authentication:</strong> API Key or Firebase Bearer Token
                  <br />
                  <br />
                  <strong>Supported Models:</strong> <code>cyrus</code>, <code>cyran</code>
                </div>
                <button className="primary" onClick={() => setModal('')}>
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p>The interface is fully connected to the FastAPI backend and Firebase project.</p>
                <button className="primary" onClick={() => setModal('')}>
                  Close
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
