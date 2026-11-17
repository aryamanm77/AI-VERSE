from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Dict, Any, Optional
from app.schemas.workers import (
    WorkerRegisterRequest,
    WorkerHeartbeatRequest,
    WorkerHeartbeatResponse,
    WorkerResponse
)
from app.schemas.jobs import (
    JobClaimResponse,
    JobCompleteRequest,
    JobFailRequest
)
from app.security.worker_auth import get_authenticated_worker
from app.services.worker_service import worker_service
from app.services.job_service import job_service
from app.scheduler.queue_manager import queue_manager
from app.utils.logging import setup_logger

logger = setup_logger("worker_routes")
router = APIRouter(prefix="/api/workers", tags=["Workers Daemon Protocol"])


@router.post("/register")
async def register_worker(
    body: WorkerRegisterRequest,
    x_worker_token: Optional[str] = Header(None, alias="X-Worker-Token")
):
    """
    Initial handshake when worker notebook starts.
    Validates worker identity, worker token, and assigned model.
    Sets status to 'initializing'.
    """
    if not x_worker_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Worker-Token header."
        )

    try:
        worker = worker_service.register_worker(
            worker_id=body.worker_id,
            token=x_worker_token,
            model_id=body.model_id,
            provider=body.provider,
            worker_version=body.worker_version
        )
        return {
            "status": "registered",
            "worker_id": worker["workerId"],
            "model_id": worker["modelId"],
            "message": "Worker registered successfully. Please begin heartbeat loop and load model."
        }
    except (PermissionError, ValueError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/heartbeat", response_model=WorkerHeartbeatResponse)
async def worker_heartbeat(
    body: WorkerHeartbeatRequest,
    x_worker_token: Optional[str] = Header(None, alias="X-Worker-Token")
):
    """
    Periodic heartbeat from worker (every 10-30s).
    Updates status, GPU metadata, current job, and timestamps.
    """
    if not x_worker_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Worker-Token header."
        )

    try:
        resp = worker_service.process_heartbeat(
            worker_id=body.worker_id,
            token=x_worker_token,
            status=body.status,
            gpu_name=body.gpu_name,
            gpu_memory=body.gpu_memory,
            available_memory=body.available_memory,
            current_job_id=body.current_job_id,
            error_message=body.error_message
        )
        return resp
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/jobs/next")
async def get_next_job(worker: Dict[str, Any] = Depends(get_authenticated_worker)):
    """
    Worker polling endpoint. Atomically claims the highest priority queued job
    matching the worker's assigned model family (CYRUS or CYRAN).
    Guarantees no cross-model routing.
    """
    worker_id = worker["workerId"]
    model_id = worker["modelId"]

    claimed = await queue_manager.claim_next_job(worker_id=worker_id, model_id=model_id)
    if not claimed:
        # Return 200 with job: null when queue is empty
        return {"job": None}

    return {
        "job": {
            "job_id": claimed["jobId"],
            "model_id": claimed["modelId"],
            "payload": claimed["requestPayload"],
            "priority": claimed.get("priority", 1),
            "lease_expires_at": claimed["leaseExpiresAt"]
        }
    }


@router.post("/jobs/{job_id}/complete")
async def complete_job(
    job_id: str,
    body: JobCompleteRequest,
    worker: Dict[str, Any] = Depends(get_authenticated_worker)
):
    """
    Worker submits generated response upon model inference completion.
    Validates lease and ownership, updates worker statistics, usage records, and logs.
    """
    try:
        updated = job_service.complete_job(
            job_id=job_id,
            worker_id=worker["workerId"],
            result=body.result,
            input_tokens=body.input_tokens or 0,
            output_tokens=body.output_tokens or 0,
            latency_ms=body.latency_ms or 0.0
        )
        return {"status": "success", "job_id": job_id}
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/jobs/{job_id}/fail")
async def fail_job(
    job_id: str,
    body: JobFailRequest,
    worker: Dict[str, Any] = Depends(get_authenticated_worker)
):
    """
    Worker reports inference or out-of-memory error.
    Handles retry logic within limits or marks job permanently failed.
    """
    try:
        updated = job_service.fail_job(
            job_id=job_id,
            worker_id=worker["workerId"],
            error_msg=body.error,
            can_retry=body.can_retry
        )
        return {"status": "reported", "job_id": job_id, "retry_count": updated.get("retryCount")}
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
