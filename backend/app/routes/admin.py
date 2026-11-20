from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.schemas.workers import WorkerAdminCreateRequest, WorkerCreatedResponse, WorkerResponse
from app.security.permissions import require_admin
from app.services.worker_service import worker_service
from app.services.job_service import job_service
from app.services.usage_service import usage_service
from app.services.firebase_service import firebase_service
from app.services.key_bank_service import key_bank_service
from app.utils.logging import setup_logger

logger = setup_logger("admin_routes")
router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])


class AddKeyBankRequest(BaseModel):
    key: str
    provider: Optional[str] = None
    account_id: Optional[str] = None


@router.get("/key-bank")
async def get_key_bank_status(admin: Dict[str, Any] = Depends(require_admin)):
    """Returns the health status and usage metrics of all keys in the bank."""
    return {
        "total_keys": key_bank_service.total_keys_count(),
        "active_keys": key_bank_service.active_keys_count(),
        "keys": key_bank_service.get_bank_status()
    }


@router.post("/key-bank")
async def add_key_to_bank(
    body: AddKeyBankRequest,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Adds a new API key to the live pool (Groq, Cloudflare Workers AI, or NVIDIA NIM)."""
    record = key_bank_service.add_key(api_key=body.key, provider=body.provider, account_id=body.account_id)
    return {"status": "added", "key_id": record.key_id, "masked_key": record.masked_key, "provider": record.provider}


@router.get("/overview")
async def get_admin_overview(admin: Dict[str, Any] = Depends(require_admin)):
    """Fetches high-level metrics across users, workers, queues, and subscriptions."""
    return usage_service.get_platform_admin_overview()


@router.get("/workers", response_model=List[WorkerResponse])
async def list_workers(admin: Dict[str, Any] = Depends(require_admin)):
    """Lists all registered workers with real-time status and telemetry."""
    return worker_service.list_workers()


@router.post("/workers", response_model=WorkerCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_worker(
    body: WorkerAdminCreateRequest,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """
    Provisions a new worker record and generates a cryptographically secure token.
    IMPORTANT: The raw worker token is revealed ONLY ONCE in this response.
    Pass this token as CYRUS_WORKER_TOKEN or CYRAN_WORKER_TOKEN in Colab / Kaggle Secrets.
    """
    try:
        worker_doc, token = worker_service.admin_create_worker(
            worker_id=body.worker_id,
            model_id=body.model_id,
            provider=body.provider,
            description=body.description
        )
        return {
            "worker_id": worker_doc["workerId"],
            "model_id": worker_doc["modelId"],
            "provider": worker_doc["provider"],
            "token": token,
            "status": worker_doc["status"],
            "registered_at": worker_doc["registeredAt"]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/workers/{worker_id}/toggle")
async def toggle_worker(
    worker_id: str,
    enable: bool,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Enables or disables worker."""
    success = worker_service.toggle_worker_status(worker_id, enable=enable)
    if not success:
        raise HTTPException(status_code=404, detail="Worker not found.")
    return {"status": "success", "worker_id": worker_id, "enabled": enable}


@router.get("/workers/{worker_id}/events")
async def get_worker_events(
    worker_id: str,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Fetches lifecycle events for a specific worker."""
    return worker_service.list_worker_events(worker_id=worker_id)


@router.get("/queue")
async def get_queue_jobs(
    status: Optional[str] = None,
    limit: int = 50,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Inspects pending, assigned, or completed request jobs."""
    return job_service.list_jobs(status=status, limit=limit)


@router.post("/queue/{job_id}/cancel")
async def cancel_job(
    job_id: str,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Cancels a job in the queue."""
    success = job_service.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=400, detail="Unable to cancel job (it may already be completed or not exist).")
    return {"status": "cancelled", "job_id": job_id}


@router.get("/logs")
async def get_request_logs(
    limit: int = 100,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Fetches platform request logs."""
    return firebase_service.query_collection("request_logs", order_by="createdAt", descending=True, limit=limit)
