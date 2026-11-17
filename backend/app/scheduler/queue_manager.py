import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from app.config import get_settings
from app.services.firebase_service import firebase_service
from app.utils.datetime_utils import utc_now, utc_iso_now
from app.utils.logging import setup_logger

logger = setup_logger("queue_manager")


class QueueManager:
    def __init__(self):
        self.settings = get_settings()
        self._lock = asyncio.Lock()

    def clean_expired_leases(self) -> int:
        """
        Identifies jobs in 'assigned' or 'processing' whose lease has expired,
        and either re-queues them or marks them failed if max retries exceeded.
        """
        now = utc_now()
        active_jobs = firebase_service.query_collection(
            "request_jobs",
            filters=[("status", "in", ["assigned", "processing"])]
        )
        expired_count = 0
        for job in active_jobs:
            lease_str = job.get("leaseExpiresAt")
            if not lease_str:
                continue
            try:
                lease_dt = datetime.fromisoformat(lease_str)
                if lease_dt.tzinfo is None:
                    lease_dt = lease_dt.replace(tzinfo=timezone.utc)
                if now > lease_dt:
                    job_id = job.get("jobId")
                    retry_count = job.get("retryCount", 0)
                    max_retries = job.get("maxRetries", self.settings.MAX_JOB_RETRIES)

                    if retry_count < max_retries:
                        logger.warning(f"Lease expired for job {job_id}. Re-queueing (retry {retry_count + 1}/{max_retries})")
                        firebase_service.update_document("request_jobs", job_id, {
                            "status": "queued",
                            "assignedWorkerId": None,
                            "leaseExpiresAt": None,
                            "retryCount": retry_count + 1,
                            "updatedAt": utc_iso_now()
                        })
                    else:
                        logger.error(f"Lease expired for job {job_id} and max retries exceeded. Marking failed.")
                        firebase_service.update_document("request_jobs", job_id, {
                            "status": "failed",
                            "error": "Worker lease expired and retry limit reached.",
                            "completedAt": utc_iso_now()
                        })
                    expired_count += 1
            except Exception as e:
                logger.error(f"Error checking lease expiration for job: {e}")
        return expired_count

    async def claim_next_job(self, worker_id: str, model_id: str) -> Optional[Dict[str, Any]]:
        """
        Concurrency-safe claiming of the next eligible job for the worker's assigned model.
        Orders by priority DESCENDING, then createdAt ASCENDING.
        """
        async with self._lock:
            # First clean any dead leases
            self.clean_expired_leases()

            norm_model = model_id.upper()
            # Fetch queued jobs matching this worker's model family
            queued_jobs = firebase_service.query_collection(
                "request_jobs",
                filters=[("status", "==", "queued"), ("modelId", "==", norm_model)]
            )

            if not queued_jobs:
                return None

            # Sort by priority descending (4=Ultra, 3=Pro, 2=Basic, 1=Starter), then createdAt ascending
            queued_jobs.sort(key=lambda j: (-j.get("priority", 1), j.get("createdAt", "")))
            target_job = queued_jobs[0]
            job_id = target_job["jobId"]

            now = utc_now()
            lease_expires = (now + timedelta(seconds=self.settings.JOB_LEASE_SECONDS)).isoformat()
            now_iso = now.isoformat()

            # Atomically update status to assigned
            updates = {
                "status": "assigned",
                "assignedWorkerId": worker_id,
                "assignedAt": now_iso,
                "leaseExpiresAt": lease_expires,
                "updatedAt": now_iso
            }
            firebase_service.update_document("request_jobs", job_id, updates)

            # Update worker doc
            firebase_service.update_document("workers", worker_id, {
                "status": "busy",
                "currentJobId": job_id,
                "updatedAt": now_iso
            })

            target_job.update(updates)
            logger.info(f"Worker {worker_id} successfully claimed job {job_id} (Model: {norm_model}, Priority: {target_job.get('priority')})")
            return target_job


queue_manager = QueueManager()
