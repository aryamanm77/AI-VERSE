import pytest
from app.services.worker_service import worker_service
from app.services.job_service import job_service
from app.scheduler.queue_manager import queue_manager
from app.services.auth_service import auth_service


def test_worker_registration_and_heartbeat(client):
    # 1. Admin creates worker
    w_doc, raw_token = worker_service.admin_create_worker(
        worker_id="cyrus-colab-1",
        model_id="CYRUS",
        provider="Google Colab"
    )
    assert w_doc["status"] == "disabled"
    assert raw_token.startswith("wtk_verse_")

    # 2. Worker registers
    reg_resp = client.post(
        "/api/workers/register",
        json={
            "worker_id": "cyrus-colab-1",
            "model_id": "CYRUS",
            "provider": "Google Colab",
            "worker_version": "1.0.0"
        },
        headers={"X-Worker-Token": raw_token}
    )
    assert reg_resp.status_code == 200
    assert reg_resp.json()["status"] == "registered"

    # 3. Worker sends heartbeat
    hb_resp = client.post(
        "/api/workers/heartbeat",
        json={
            "worker_id": "cyrus-colab-1",
            "status": "online",
            "gpu_name": "Tesla T4",
            "gpu_memory": 15360,
            "available_memory": 14000
        },
        headers={"X-Worker-Token": raw_token}
    )
    assert hb_resp.status_code == 200
    assert hb_resp.json()["acknowledged"] is True


@pytest.mark.asyncio
async def test_job_lifecycle_and_claiming():
    # 1. Setup user and worker
    auth_service.get_or_create_user("user_job_tester")
    w_doc, raw_token = worker_service.admin_create_worker(
        worker_id="cyrus-colab-test",
        model_id="CYRUS",
        provider="Google Colab"
    )
    worker_service.register_worker("cyrus-colab-test", raw_token, "CYRUS", "Google Colab")
    worker_service.process_heartbeat("cyrus-colab-test", raw_token, "online", "Tesla T4", 15360)

    # 2. Create job
    job = job_service.create_chat_job(
        user_id="user_job_tester",
        model_id="cyrus",
        payload={"model": "cyrus", "messages": [{"role": "user", "content": "Hello"}]},
        priority=2
    )
    assert job["status"] == "queued"

    # 3. Worker claims next job
    claimed = await queue_manager.claim_next_job(worker_id="cyrus-colab-test", model_id="CYRUS")
    assert claimed is not None
    assert claimed["jobId"] == job["jobId"]
    assert claimed["status"] == "assigned"
    assert claimed["assignedWorkerId"] == "cyrus-colab-test"

    # 4. Worker completes job
    completed = job_service.complete_job(
        job_id=claimed["jobId"],
        worker_id="cyrus-colab-test",
        result={"text": "Hello, human!", "finish_reason": "stop"},
        input_tokens=10,
        output_tokens=15,
        latency_ms=250.0
    )
    assert completed["status"] == "completed"
    assert completed["result"]["text"] == "Hello, human!"
