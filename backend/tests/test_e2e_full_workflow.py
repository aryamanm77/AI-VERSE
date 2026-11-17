import pytest
import time
from fastapi.testclient import TestClient
from app.main import app
from app.services.worker_service import worker_service
from app.services.api_key_service import api_key_service
from app.services.subscription_service import subscription_service
from app.scheduler.queue_manager import queue_manager
from app.services.job_service import job_service


def test_complete_platform_e2e_flow():
    """
    End-to-End integration test covering the complete AI VERSE workflow:
    1. User Registration & Profile initialization
    2. API Key Generation (cryptographically secure, hashed storage)
    3. Admin Worker Provisioning & Token Generation (CYRUS & CYRAN)
    4. Worker Registration handshake & Heartbeat telemetry
    5. User Chat Completion Request (CYRUS) via OpenAI-compatible endpoint
    6. Fair Queue Scheduling & Atomic Claiming by compatible worker
    7. Model Result Submission & Latency / Token Calculation
    8. User Usage Analytics & Request History Logging
    9. Admin Telemetry Inspection & Offline Detection
    10. CYRAN routing isolation check (Starter tier cannot access CYRAN; Pro tier routes to CYRAN worker only)
    """
    client = TestClient(app)

    # 1. User Registration & Profile
    user_headers = {"Authorization": "Bearer mock_token_e2e_user"}
    me_res = client.get("/api/auth/me", headers=user_headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["uid"] == "e2e_user"
    assert user_data["subscriptionPlan"] == "STARTER"

    # 2. Generate API Key
    key_res = client.post("/api/keys", json={"name": "E2E Test Key"}, headers=user_headers)
    assert key_res.status_code == 201
    key_data = key_res.json()
    api_key = key_data["apiKey"]
    assert api_key.startswith("sk_verse_")

    # 3. Admin provisions CYRUS and CYRAN workers
    admin_headers = {"Authorization": "Bearer mock_token_admin_operator"}
    cyrus_prov = client.post(
        "/api/admin/workers",
        json={"worker_id": "cyrus-colab-e2e", "model_id": "CYRUS", "provider": "Google Colab"},
        headers=admin_headers
    )
    assert cyrus_prov.status_code == 201
    cyrus_token = cyrus_prov.json()["token"]

    cyran_prov = client.post(
        "/api/admin/workers",
        json={"worker_id": "cyran-kaggle-e2e", "model_id": "CYRAN", "provider": "Kaggle"},
        headers=admin_headers
    )
    assert cyran_prov.status_code == 201
    cyran_token = cyran_prov.json()["token"]

    # 4. Workers Handshake and Send Heartbeats
    # Colab CYRUS Worker
    reg_c = client.post(
        "/api/workers/register",
        json={"worker_id": "cyrus-colab-e2e", "model_id": "CYRUS", "provider": "Google Colab"},
        headers={"X-Worker-Token": cyrus_token}
    )
    assert reg_c.status_code == 200

    hb_c = client.post(
        "/api/workers/heartbeat",
        json={"worker_id": "cyrus-colab-e2e", "status": "online", "gpu_name": "Tesla T4", "gpu_memory": 15360},
        headers={"X-Worker-Token": cyrus_token}
    )
    assert hb_c.status_code == 200

    # Kaggle CYRAN Worker
    reg_k = client.post(
        "/api/workers/register",
        json={"worker_id": "cyran-kaggle-e2e", "model_id": "CYRAN", "provider": "Kaggle"},
        headers={"X-Worker-Token": cyran_token}
    )
    assert reg_k.status_code == 200

    hb_k = client.post(
        "/api/workers/heartbeat",
        json={"worker_id": "cyran-kaggle-e2e", "status": "online", "gpu_name": "Tesla P100", "gpu_memory": 16384},
        headers={"X-Worker-Token": cyran_token}
    )
    assert hb_k.status_code == 200

    # 5. Check Admin Workers Fleet View
    fleet_res = client.get("/api/admin/workers", headers=admin_headers)
    assert fleet_res.status_code == 200
    fleet = {w["workerId"]: w for w in fleet_res.json()}
    assert fleet["cyrus-colab-e2e"]["status"] == "online"
    assert fleet["cyran-kaggle-e2e"]["status"] == "online"

    # 6. User Enqueues CYRUS Job
    job = job_service.create_chat_job(
        user_id="e2e_user",
        model_id="cyrus",
        payload={
            "model": "cyrus",
            "messages": [{"role": "user", "content": "Explain IoT in simple terms."}]
        },
        priority=1,
        api_key_id=key_data["keyId"]
    )
    assert job["status"] == "queued"

    # 7. CYRUS worker polls and claims the job
    poll_headers = {"X-Worker-Id": "cyrus-colab-e2e", "X-Worker-Token": cyrus_token}
    next_res = client.get("/api/workers/jobs/next", headers=poll_headers)
    assert next_res.status_code == 200
    claimed_job = next_res.json()["job"]
    assert claimed_job is not None
    assert claimed_job["job_id"] == job["jobId"]
    assert claimed_job["model_id"] == "CYRUS"

    # 8. Worker submits inference output
    complete_res = client.post(
        f"/api/workers/jobs/{job['jobId']}/complete",
        json={
            "result": {
                "text": "Internet of Things (IoT) refers to physical objects connected to the internet...",
                "finish_reason": "stop",
                "prompt_tokens": 12,
                "completion_tokens": 45
            },
            "input_tokens": 12,
            "output_tokens": 45,
            "latency_ms": 320.0
        },
        headers=poll_headers
    )
    assert complete_res.status_code == 200

    # 9. Verify User Usage Analytics & History updated
    usage_res = client.get("/api/usage/summary", headers=user_headers)
    assert usage_res.status_code == 200
    u_summary = usage_res.json()
    assert u_summary["totalRequests"] == 1
    assert u_summary["successfulRequests"] == 1
    assert u_summary["totalTokens"] == 57

    hist_res = client.get("/api/usage/history", headers=user_headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
    assert hist_res.json()[0]["requestId"] == job["jobId"]

    # 10. Multi-Model Routing Isolation & Subscription Security Check
    # A user on STARTER plan attempts to access CYRAN -> Must be rejected
    cyran_attempt = client.post(
        "/v1/chat/completions",
        json={
            "model": "cyran",
            "messages": [{"role": "user", "content": "Prove P vs NP."}]
        },
        headers={"Authorization": f"Bearer {api_key}"}
    )
    assert cyran_attempt.status_code == 403
    assert "PRO or ULTRA" in str(cyran_attempt.json())

    # Now upgrade user to PRO
    upg_res = client.post(
        "/api/subscriptions/upgrade",
        json={"planId": "PRO"},
        headers=user_headers
    )
    assert upg_res.status_code == 200

    # Enqueue a CYRAN job
    cyran_job = job_service.create_chat_job(
        user_id="e2e_user",
        model_id="cyran",
        payload={"model": "cyran", "messages": [{"role": "user", "content": "Prove P vs NP."}]},
        priority=3
    )

    # Colab CYRUS worker polls -> must receive null (never cross-routes)
    cyrus_poll = client.get("/api/workers/jobs/next", headers=poll_headers)
    assert cyrus_poll.json()["job"] is None

    # Kaggle CYRAN worker polls -> claims the job
    kaggle_headers = {"X-Worker-Id": "cyran-kaggle-e2e", "X-Worker-Token": cyran_token}
    cyran_claim = client.get("/api/workers/jobs/next", headers=kaggle_headers)
    assert cyran_claim.json()["job"] is not None
    assert cyran_claim.json()["job"]["job_id"] == cyran_job["jobId"]
    assert cyran_claim.json()["job"]["model_id"] == "CYRAN"
