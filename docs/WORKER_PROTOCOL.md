# AI VERSE — Worker Daemon Protocol Specification (v1.0.0)

The Worker Protocol defines how GPU worker instances (Google Colab, Kaggle, Local Mock) authenticate, report telemetry, claim jobs, and return inference output.

## 1. Authentication
All worker endpoints require two HTTP headers:
- `X-Worker-Id`: The unique identifier registered in the platform (e.g. `cyrus-colab-1`).
- `X-Worker-Token`: The plaintext worker secret token issued by the administrator (`wtk_verse_...`).

The backend validates the token using HMAC-SHA256 constant-time comparison against the stored hash in Firestore.

## 2. Worker Lifecycle & Endpoints

### 2.1 Registration Handshake
- **Endpoint**: `POST /api/workers/register`
- **Payload**:
  ```json
  {
    "worker_id": "cyrus-colab-1",
    "model_id": "CYRUS",
    "provider": "Google Colab",
    "worker_version": "1.0.0"
  }
  ```
- **Response**: `200 OK` sets status to `initializing`.

### 2.2 Heartbeat & Telemetry
Workers send heartbeats every 10-20 seconds.
- **Endpoint**: `POST /api/workers/heartbeat`
- **Payload**:
  ```json
  {
    "worker_id": "cyrus-colab-1",
    "status": "online",
    "gpu_name": "Tesla T4",
    "gpu_memory": 15360,
    "available_memory": 14200,
    "current_job_id": null
  }
  ```
- If a worker misses heartbeats exceeding `WORKER_HEARTBEAT_TIMEOUT_SECONDS` (default: 45s), the backend transitions its status to `offline`.

### 2.3 Atomic Job Claiming (Pull)
Workers continuously poll the queue for jobs matching their assigned model family.
- **Endpoint**: `GET /api/workers/jobs/next`
- **Response**:
  - `{"job": null}` if no matching jobs are queued.
  - Or job payload with lease:
  ```json
  {
    "job": {
      "job_id": "job_a1b2c3d4e5f6",
      "model_id": "CYRUS",
      "payload": {
        "messages": [{"role": "user", "content": "Explain IoT"}],
        "temperature": 0.7,
        "max_tokens": 1024
      },
      "priority": 2,
      "lease_expires_at": "2026-11-17T16:00:00Z"
    }
  }
  ```

### 2.4 Job Completion
- **Endpoint**: `POST /api/workers/jobs/{job_id}/complete`
- **Payload**:
  ```json
  {
    "result": {
      "text": "The generated answer from model inference...",
      "finish_reason": "stop",
      "prompt_tokens": 15,
      "completion_tokens": 84
    },
    "input_tokens": 15,
    "output_tokens": 84,
    "latency_ms": 1120.5
  }
  ```

### 2.5 Job Failure Reporting
- **Endpoint**: `POST /api/workers/jobs/{job_id}/fail`
- **Payload**:
  ```json
  {
    "error": "CUDA Out Of Memory error during forward pass",
    "can_retry": true
  }
  ```
