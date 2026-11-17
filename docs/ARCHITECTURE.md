# AI VERSE — System Architecture & Design Specification

**Tagline:** "One Universe. Infinite Intelligence."

## 1. Executive Overview

AI VERSE is a distributed, multi-model AI API platform designed around a **worker-pull queuing model**. Rather than relying on rigid monolithic GPU clusters or simulated endpoints, AI VERSE orchestrates real model workers deployed on Google Colab and Kaggle notebook runtimes, managed via a high-performance FastAPI gateway and Firebase Cloud Firestore.

## 2. Platform Architecture Diagram

```
[Developer Apps / OpenAI SDK]
              |
              v
[FastAPI Gateway /v1 Endpoints]
       |              |
       | Bearer Auth  | X-Worker-Token
       v              v
[Firebase Auth & Firestore] <==== [Queue Manager & Model Router]
                                       |              |
                                 CYRUS |        CYRAN |
                                       v              v
                         [Colab Worker Cluster]  [Kaggle Worker Cluster]
                          (cyrus-colab-1)         (cyran-kaggle-1)
```

## 3. Core Architectural Components

### 3.1 API Gateway & Router
- **OpenAI Compatible Endpoint**: `POST /v1/chat/completions` allows drop-in integration with `openai` Python and Node libraries.
- **Model Decoupling**: Customers request `cyrus` or `cyran`. Internal checkpoints and weight locations are never leaked to clients.
- **Fair Scheduling**: Job priority is governed by subscription tier (Starter = 1, Basic = 2, Pro = 3, Ultra = 4).

### 3.2 Firebase Cloud Firestore
- **Users**: Account state, subscription tier, and role metadata (`users/{uid}`).
- **Subscriptions**: Pricing in INR, tier definitions, and active period (`subscriptions/{sub_id}`).
- **API Keys**: Cryptographically random keys (`sk_verse_...`). Stored as HMAC-SHA256 hashes (`api_keys/{key_id}`).
- **Workers**: Real-time heartbeat, GPU telemetry, and status flags (`workers/{worker_id}`).
- **Request Jobs**: Concurrency-safe queue with leases (`request_jobs/{job_id}`).
- **Request Logs**: Audit records with latency, token usage, and status (`request_logs/{log_id}`).

### 3.3 Worker-Pull Orchestration
Workers poll `GET /api/workers/jobs/next`. Job claiming is concurrency-safe:
1. Worker identity and token hash are validated.
2. Worker must be `online` and assigned to the same model family as the job.
3. Queue manager atomically claims the highest priority eligible job.
4. Worker sets a lease duration (e.g., 60 seconds). If the worker crashes or disconnects, the lease expires and the job is automatically returned to the queue.
5. Upon model inference, the worker submits output via `POST /api/workers/jobs/{job_id}/complete`.
