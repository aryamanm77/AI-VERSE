import {
  UserProfile,
  ApiKeyItem,
  SubscriptionPlan,
  ModelInfo,
  WorkerItem,
  QueueJobItem,
  UsageSummary,
  RequestLogItem
} from '../types';

const getBaseUrl = (): string => {
  const custom = localStorage.getItem('aiverse-url');
  if (custom && custom.trim()) return custom.replace(/\/$/, '');
  return (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';
};

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail?.error?.message || errJson.detail || errJson.message || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  // System & Health
  async getSystemStatus(): Promise<any> {
    return this.request('/api/system/status');
  }

  // Profile
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/auth/me');
  }

  async updateProfile(data: { displayName?: string; photoURL?: string }): Promise<UserProfile> {
    return this.request<UserProfile>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Subscriptions
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.request<SubscriptionPlan[]>('/api/subscriptions/plans');
  }

  async getMySubscription(): Promise<any> {
    return this.request('/api/subscriptions/my');
  }

  async upgradeSubscription(planId: string, paymentProvider: string = 'manual'): Promise<any> {
    return this.request('/api/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentProvider })
    });
  }

  // API Keys
  async getApiKeys(): Promise<ApiKeyItem[]> {
    return this.request<ApiKeyItem[]>('/api/keys');
  }

  async createApiKey(name: string): Promise<{ keyId: string; name: string; apiKey: string; keyPrefix: string; createdAt: string }> {
    return this.request('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }

  async revokeApiKey(keyId: string): Promise<any> {
    return this.request(`/api/keys/${keyId}`, {
      method: 'DELETE'
    });
  }

  // Models
  async getModels(): Promise<{ object: string; data: ModelInfo[] }> {
    return this.request('/v1/models');
  }

  // Chat Completion (Playground)
  async createChatCompletion(payload: {
    model: string;
    messages: { role: string; content: string }[];
    temperature?: number;
    max_tokens?: number;
  }): Promise<any> {
    return this.request('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Analytics & Logs
  async getUsageSummary(): Promise<UsageSummary> {
    return this.request<UsageSummary>('/api/usage/summary');
  }

  async getRequestHistory(limit: number = 50): Promise<RequestLogItem[]> {
    return this.request<RequestLogItem[]>(`/api/usage/history?limit=${limit}`);
  }

  // Admin Endpoints
  async getAdminOverview(): Promise<any> {
    return this.request('/api/admin/overview');
  }

  async getAdminWorkers(): Promise<WorkerItem[]> {
    return this.request<WorkerItem[]>('/api/admin/workers');
  }

  async createAdminWorker(data: {
    worker_id: string;
    model_id: string;
    provider: string;
    description?: string;
  }): Promise<{ worker_id: string; model_id: string; provider: string; token: string; status: string }> {
    return this.request('/api/admin/workers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async toggleWorker(workerId: string, enable: boolean): Promise<any> {
    return this.request(`/api/admin/workers/${workerId}/toggle?enable=${enable}`, {
      method: 'POST'
    });
  }

  async getWorkerEvents(workerId: string): Promise<any[]> {
    return this.request(`/api/admin/workers/${workerId}/events`);
  }

  async getAdminQueue(status?: string): Promise<QueueJobItem[]> {
    const qs = status ? `?status=${status}` : '';
    return this.request<QueueJobItem[]>(`/api/admin/queue${qs}`);
  }

  async cancelQueueJob(jobId: string): Promise<any> {
    return this.request(`/api/admin/queue/${jobId}/cancel`, {
      method: 'POST'
    });
  }

  async getAdminLogs(limit: number = 100): Promise<RequestLogItem[]> {
    return this.request<RequestLogItem[]>(`/api/admin/logs?limit=${limit}`);
  }

  async getAdminUsers(): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('/api/users');
  }

  async updateUserStatus(uid: string, status: string): Promise<any> {
    return this.request(`/api/users/${uid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus: status })
    });
  }
}

export const api = new ApiService();
