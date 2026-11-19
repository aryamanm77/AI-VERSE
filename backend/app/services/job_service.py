import asyncio
import uuid
from typing import Optional, Dict, Any, List
from app.config import get_settings
from app.services.firebase_service import firebase_service
from app.scheduler.queue_manager import queue_manager
from app.scheduler.model_router import model_router
from app.utils.datetime_utils import utc_iso_now
from app.utils.logging import setup_logger

logger = setup_logger("job_service")


class JobService:
    def __init__(self):
        self.settings = get_settings()

    def create_chat_job(
        self,
        user_id: str,
        model_id: str,
        payload: Dict[str, Any],
        priority: int = 1,
        api_key_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a new queued job in Firestore.
        """
        job_id = f"job_{uuid.uuid4().hex[:16]}"
        now = utc_iso_now()
        canonical_model = model_router.get_target_model_family(model_id)

        job_data = {
            "jobId": job_id,
            "userId": user_id,
            "apiKeyId": api_key_id,
            "modelId": canonical_model,
            "requestPayload": payload,
            "status": "queued",  # queued, assigned, processing, completed, failed, cancelled, expired
            "assignedWorkerId": None,
            "priority": priority,
            "createdAt": now,
            "assignedAt": None,
            "startedAt": None,
            "completedAt": None,
            "leaseExpiresAt": None,
            "result": None,
            "error": None,
            "retryCount": 0,
            "maxRetries": self.settings.MAX_JOB_RETRIES,
            "idempotencyKey": None,
            "updatedAt": now
        }

        firebase_service.set_document("request_jobs", job_id, job_data)
        logger.info(f"Created chat completion job {job_id} for user {user_id} [Model: {canonical_model}, Priority: {priority}]")
        return job_data

    async def wait_for_job_completion(self, job_id: str, timeout_seconds: Optional[int] = None) -> Dict[str, Any]:
        """
        Asynchronously waits for worker to finish processing the job.
        Polls Firestore with non-blocking sleep.
        """
        timeout = timeout_seconds or self.settings.REQUEST_TIMEOUT_SECONDS
        poll_interval = 0.1  # 100ms high-frequency polling
        elapsed = 0.0

        while elapsed < timeout:
            job = firebase_service.get_document("request_jobs", job_id)
            if not job:
                raise ValueError(f"Job {job_id} disappeared from queue.")

            status = job.get("status")
            if status == "completed":
                return job
            elif status == "failed":
                err = job.get("error", "Model execution failed on worker.")
                raise RuntimeError(f"Job execution failed: {err}")
            elif status == "cancelled":
                raise RuntimeError("Job was cancelled.")

            await asyncio.sleep(poll_interval)
            elapsed += poll_interval

        # Job timed out
        firebase_service.update_document("request_jobs", job_id, {
            "status": "expired",
            "error": f"Request timed out waiting for worker after {timeout} seconds.",
            "completedAt": utc_iso_now()
        })
        raise TimeoutError(f"Job {job_id} timed out waiting for available {job.get('modelId')} worker.")

    def complete_job(
        self,
        job_id: str,
        worker_id: str,
        result: Dict[str, Any],
        input_tokens: int = 0,
        output_tokens: int = 0,
        latency_ms: float = 0.0
    ) -> Dict[str, Any]:
        """
        Marks job completed, validates ownership, updates worker statistics and logs.
        """
        job = firebase_service.get_document("request_jobs", job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found.")

        if job.get("assignedWorkerId") != worker_id:
            raise PermissionError(f"Worker {worker_id} does not own job {job_id}.")

        now = utc_iso_now()
        updates = {
            "status": "completed",
            "result": result,
            "completedAt": now,
            "leaseExpiresAt": None,
            "updatedAt": now
        }
        firebase_service.update_document("request_jobs", job_id, updates)

        # Update worker metrics
        worker = firebase_service.get_document("workers", worker_id) or {}
        completed = worker.get("completedJobs", 0) + 1
        total = worker.get("totalJobs", 0) + 1
        firebase_service.update_document("workers", worker_id, {
            "status": "online",
            "currentJobId": None,
            "completedJobs": completed,
            "totalJobs": total,
            "updatedAt": now
        })

        # Record in request_logs
        req_log_id = f"log_{uuid.uuid4().hex[:16]}"
        total_tokens = input_tokens + output_tokens
        log_entry = {
            "requestId": job_id,
            "userId": job.get("userId"),
            "apiKeyId": job.get("apiKeyId"),
            "modelId": job.get("modelId"),
            "workerId": worker_id,
            "status": "success",
            "latencyMs": latency_ms,
            "inputTokens": input_tokens,
            "outputTokens": output_tokens,
            "totalTokens": total_tokens,
            "errorCode": None,
            "createdAt": now
        }
        firebase_service.set_document("request_logs", req_log_id, log_entry)

        # Record usage record
        usage_id = f"usg_{uuid.uuid4().hex[:16]}"
        usage_entry = {
            "userId": job.get("userId"),
            "subscriptionId": f"sub_{job.get('userId')}",
            "requestId": job_id,
            "modelId": job.get("modelId"),
            "inputTokens": input_tokens,
            "outputTokens": output_tokens,
            "totalTokens": total_tokens,
            "timestamp": now
        }
        firebase_service.set_document("usage_records", usage_id, usage_entry)

        logger.info(f"Job {job_id} completed successfully by worker {worker_id} in {latency_ms:.1f}ms. Total tokens: {total_tokens}")
        job.update(updates)
        return job

    def fail_job(
        self,
        job_id: str,
        worker_id: str,
        error_msg: str,
        can_retry: bool = True
    ) -> Dict[str, Any]:
        """
        Handles job failure reported by worker.
        """
        job = firebase_service.get_document("request_jobs", job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found.")

        if job.get("assignedWorkerId") != worker_id:
            raise PermissionError(f"Worker {worker_id} does not own job {job_id}.")

        retry_count = job.get("retryCount", 0)
        max_retries = job.get("maxRetries", self.settings.MAX_JOB_RETRIES)
        now = utc_iso_now()

        # Update worker stats
        worker = firebase_service.get_document("workers", worker_id) or {}
        failed_count = worker.get("failedJobs", 0) + 1
        total = worker.get("totalJobs", 0) + 1
        firebase_service.update_document("workers", worker_id, {
            "status": "online",
            "currentJobId": None,
            "failedJobs": failed_count,
            "totalJobs": total,
            "lastError": error_msg[:256],
            "updatedAt": now
        })

        if can_retry and retry_count < max_retries:
            updates = {
                "status": "queued",
                "assignedWorkerId": None,
                "leaseExpiresAt": None,
                "retryCount": retry_count + 1,
                "error": f"Worker error (retry {retry_count + 1}): {error_msg[:128]}",
                "updatedAt": now
            }
            logger.warning(f"Re-queueing job {job_id} following failure on {worker_id}: {error_msg}")
        else:
            updates = {
                "status": "failed",
                "error": error_msg,
                "completedAt": now,
                "leaseExpiresAt": None,
                "updatedAt": now
            }
            logger.error(f"Job {job_id} permanently failed on worker {worker_id}: {error_msg}")

            # Log failure to request_logs
            req_log_id = f"log_{uuid.uuid4().hex[:16]}"
            firebase_service.set_document("request_logs", req_log_id, {
                "requestId": job_id,
                "userId": job.get("userId"),
                "apiKeyId": job.get("apiKeyId"),
                "modelId": job.get("modelId"),
                "workerId": worker_id,
                "status": "error",
                "latencyMs": 0,
                "inputTokens": 0,
                "outputTokens": 0,
                "totalTokens": 0,
                "errorCode": "worker_execution_error",
                "createdAt": now
            })

        firebase_service.update_document("request_jobs", job_id, updates)
        job.update(updates)
        return job

    def list_jobs(self, user_id: Optional[str] = None, status: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        filters = []
        if user_id:
            filters.append(("userId", "==", user_id))
        if status:
            filters.append(("status", "==", status))
        return firebase_service.query_collection("request_jobs", filters=filters if filters else None, order_by="createdAt", descending=True, limit=limit)

    def cancel_job(self, job_id: str) -> bool:
        job = firebase_service.get_document("request_jobs", job_id)
        if not job or job.get("status") in {"completed", "failed", "cancelled"}:
            return False
        return firebase_service.update_document("request_jobs", job_id, {
            "status": "cancelled",
            "completedAt": utc_iso_now(),
            "updatedAt": utc_iso_now()
        })


job_service = JobService()
