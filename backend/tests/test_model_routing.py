import pytest
from app.services.worker_service import worker_service
from app.services.job_service import job_service
from app.scheduler.queue_manager import queue_manager
from app.services.auth_service import auth_service


@pytest.mark.asyncio
async def test_strict_model_routing_isolation():
    auth_service.get_or_create_user("routing_tester")

    # Provision CYRUS and CYRAN workers
    _, cyrus_token = worker_service.admin_create_worker("worker-cyrus", "CYRUS", "Colab")
    worker_service.register_worker("worker-cyrus", cyrus_token, "CYRUS", "Colab")
    worker_service.process_heartbeat("worker-cyrus", cyrus_token, "online")

    _, cyran_token = worker_service.admin_create_worker("worker-cyran", "CYRAN", "Kaggle")
    worker_service.register_worker("worker-cyran", cyran_token, "CYRAN", "Kaggle")
    worker_service.process_heartbeat("worker-cyran", cyran_token, "online")

    # Create CYRAN job
    job_cyran = job_service.create_chat_job(
        user_id="routing_tester",
        model_id="cyran",
        payload={"model": "cyran", "messages": [{"role": "user", "content": "Complex logic"}]}
    )

    # 1. CYRUS worker attempts to poll for jobs -> must receive None
    cyrus_claimed = await queue_manager.claim_next_job("worker-cyrus", "CYRUS")
    assert cyrus_claimed is None

    # 2. CYRAN worker polls -> must claim the job
    cyran_claimed = await queue_manager.claim_next_job("worker-cyran", "CYRAN")
    assert cyran_claimed is not None
    assert cyran_claimed["jobId"] == job_cyran["jobId"]
    assert cyran_claimed["modelId"] == "CYRAN"
