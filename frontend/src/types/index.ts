export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: 'user' | 'admin';
  accountStatus: 'active' | 'suspended' | 'disabled';
  subscriptionPlan: 'STARTER' | 'BASIC' | 'PRO' | 'ULTRA';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  createdAt?: string;
  emailVerified: boolean;
}

export interface ApiKeyItem {
  keyId: string;
  name: string;
  keyPrefix: string;
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
}

export interface SubscriptionPlan {
  planId: string;
  name: string;
  price: number;
  currency: string;
  billingInterval: string;
  allowedModels: string[];
  priority: number;
  description: string;
  features: string[];
}

export interface ModelInfo {
  id: string;
  object: string;
  display_name: string;
  description: string;
  category: string;
  enabled: boolean;
  context_window: number;
  allowed_tiers: string[];
}

export interface WorkerItem {
  workerId: string;
  modelId: string;
  provider: string;
  status: 'initializing' | 'online' | 'busy' | 'offline' | 'error' | 'disabled';
  lastHeartbeat?: string | null;
  registeredAt: string;
  currentJobId?: string | null;
  gpuName?: string | null;
  gpuMemory?: number;
  availableMemory?: number;
  completedJobs: number;
  failedJobs: number;
  totalJobs: number;
  lastError?: string | null;
  disabledAt?: string | null;
}

export interface QueueJobItem {
  jobId: string;
  userId: string;
  apiKeyId?: string | null;
  modelId: string;
  status: 'queued' | 'assigned' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';
  assignedWorkerId?: string | null;
  priority: number;
  createdAt: string;
  assignedAt?: string | null;
  completedAt?: string | null;
  leaseExpiresAt?: string | null;
  error?: string | null;
  retryCount: number;
}

export interface UsageSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  averageLatencyMs: number;
  modelBreakdown: Record<string, number>;
}

export interface RequestLogItem {
  requestId: string;
  userId: string;
  modelId: string;
  workerId?: string;
  status: 'success' | 'error';
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  errorCode?: string | null;
  createdAt: string;
}
