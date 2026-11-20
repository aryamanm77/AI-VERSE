from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List, Tuple
from app.config import get_settings
from app.services.firebase_service import firebase_service
from app.utils.crypto import generate_worker_token, hash_worker_token, verify_hash
from app.utils.datetime_utils import utc_now, utc_iso_now
from app.utils.validation import normalize_model_id, is_valid_worker_id
from app.utils.logging import setup_logger

logger = setup_logger("worker_service")


class WorkerService:
    def __init__(self):
        self.settings = get_settings()

    def admin_create_worker(
        self,
        worker_id: str,
        model_id: str,
        provider: str,
        description: Optional[str] = None
    ) -> Tuple[Dict[str, Any], str]:
        """
        Creates a registered worker slot in Firestore and returns the generated worker token ONCE.
        """
        if not is_valid_worker_id(worker_id):
            raise ValueError("Worker ID must be 3-64 alphanumeric characters or hyphens/underscores.")

        norm_model = normalize_model_id(model_id).upper()
        now = utc_iso_now()

        # Check if worker already exists
        existing = firebase_service.get_document("workers", worker_id)
        if existing:
            raise ValueError(f"Worker with ID '{worker_id}' already exists.")

        raw_token = generate_worker_token()
        token_hash = hash_worker_token(raw_token, self.settings.WORKER_TOKEN_HASH_SECRET)

        worker_doc = {
            "workerId": worker_id,
            "modelId": norm_model,
            "provider": provider,
            "description": description or "",
            "status": "disabled",  # until initialized by token
            "tokenHash": token_hash,
            "lastHeartbeat": None,
            "registeredAt": now,
            "updatedAt": now,
            "currentJobId": None,
            "gpuName": None,
            "gpuMemory": 0,
            "availableMemory": 0,
            "runtimeVersion": None,
            "workerVersion": "1.0.0",
            "completedJobs": 0,
            "failedJobs": 0,
            "totalJobs": 0,
            "lastError": None,
            "disabledAt": None
        }

        firebase_service.set_document("workers", worker_id, worker_doc)
        self.record_event(worker_id, "WORKER_CREATED", f"Worker {worker_id} provisioned by admin.")
        logger.info(f"Admin provisioned worker {worker_id} for model {norm_model}")
        return worker_doc, raw_token

    def authenticate_worker(self, worker_id: str, token: str) -> Optional[Dict[str, Any]]:
        """Authenticates worker using token and returns worker doc if valid."""
        worker = firebase_service.get_document("workers", worker_id)
        if not worker:
            return None
        stored_hash = worker.get("tokenHash")
        if not stored_hash:
            return None
        if verify_hash(token, stored_hash, self.settings.WORKER_TOKEN_HASH_SECRET, is_worker=True):
            return worker
        return None

    def register_worker(
        self,
        worker_id: str,
        token: str,
        model_id: str,
        provider: str,
        worker_version: str = "1.0.0"
    ) -> Dict[str, Any]:
        """
        Worker handshake upon launching notebook.
        Validates token and model compatibility, sets status to 'initializing'.
        """
        worker = self.authenticate_worker(worker_id, token)
        if not worker:
            raise PermissionError("Invalid worker ID or worker authentication token.")

        expected_model = worker.get("modelId", "").upper()
        if normalize_model_id(model_id).upper() != expected_model:
            raise ValueError(f"Worker model mismatch. Assigned: {expected_model}, Attempted: {model_id}")

        now = utc_iso_now()
        updates = {
            "status": "initializing",
            "provider": provider,
            "workerVersion": worker_version,
            "updatedAt": now
        }
        firebase_service.update_document("workers", worker_id, updates)
        self.record_event(worker_id, "WORKER_REGISTERED", f"Worker {worker_id} registered successfully from {provider}.")
        worker.update(updates)
        return worker

    def process_heartbeat(
        self,
        worker_id: str,
        token: str,
        status: str,
        gpu_name: Optional[str] = None,
        gpu_memory: Optional[int] = 0,
        available_memory: Optional[int] = 0,
        current_job_id: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Updates worker health, status, GPU metrics, and timestamps.
        """
        worker = self.authenticate_worker(worker_id, token)
        if not worker:
            raise PermissionError("Worker authentication failed.")

        if worker.get("status") == "disabled":
            return {"acknowledged": False, "server_time": utc_iso_now(), "action": "shutdown"}

        # Validate status transition
        allowed_statuses = {"initializing", "online", "busy", "error"}
        new_status = status if status in allowed_statuses else "online"

        now = utc_iso_now()
        updates = {
            "status": new_status,
            "lastHeartbeat": now,
            "updatedAt": now,
            "gpuName": gpu_name or worker.get("gpuName"),
            "gpuMemory": gpu_memory if gpu_memory is not None else worker.get("gpuMemory", 0),
            "availableMemory": available_memory if available_memory is not None else worker.get("availableMemory", 0),
            "currentJobId": current_job_id
        }
        if error_message:
            updates["lastError"] = error_message

        firebase_service.update_document("workers", worker_id, updates)
        return {"acknowledged": True, "server_time": now, "action": "continue"}

    def check_and_update_offline_workers(self) -> int:
        """
        Scans workers and marks those with expired heartbeats as 'offline'.
        """
        workers = firebase_service.query_collection("workers")
        now = utc_now()
        timeout_delta = timedelta(seconds=self.settings.WORKER_HEARTBEAT_TIMEOUT_SECONDS)
        offline_count = 0

        for w in workers:
            w_id = w.get("workerId")
            status = w.get("status")
            if status in {"online", "busy", "initializing"}:
                hb_str = w.get("lastHeartbeat")
                if not hb_str:
                    firebase_service.update_document("workers", w_id, {"status": "offline", "updatedAt": utc_iso_now()})
                    offline_count += 1
                    continue
                try:
                    hb_dt = datetime.fromisoformat(hb_str)
                    if hb_dt.tzinfo is None:
                        hb_dt = hb_dt.replace(tzinfo=timezone.utc)
                    if now - hb_dt > timeout_delta:
                        firebase_service.update_document("workers", w_id, {
                            "status": "offline",
                            "updatedAt": utc_iso_now()
                        })
                        self.record_event(w_id, "WORKER_OFFLINE", f"Worker heartbeat timed out (> {self.settings.WORKER_HEARTBEAT_TIMEOUT_SECONDS}s).")
                        offline_count += 1
                except Exception as e:
                    logger.warning(f"Error parsing heartbeat for worker {w_id}: {e}")
        return offline_count

    def toggle_worker_status(self, worker_id: str, enable: bool) -> bool:
        """Admin disable/enable worker."""
        worker = firebase_service.get_document("workers", worker_id)
        if not worker:
            return False
        now = utc_iso_now()
        if enable:
            updates = {"status": "initializing", "disabledAt": None, "updatedAt": now}
        else:
            updates = {"status": "disabled", "disabledAt": now, "updatedAt": now}
        return firebase_service.update_document("workers", worker_id, updates)

    def record_event(self, worker_id: str, event_type: str, message: str, metadata: Optional[Dict[str, Any]] = None):
        """Records an entry in worker_events collection."""
        event_id = f"wev_{utc_iso_now().replace(':', '-').replace('.', '-')}_{worker_id[:8]}"
        data = {
            "eventId": event_id,
            "workerId": worker_id,
            "eventType": event_type,
            "message": message,
            "metadata": metadata or {},
            "createdAt": utc_iso_now()
        }
        firebase_service.set_document("worker_events", event_id, data)

    def list_workers(self) -> List[Dict[str, Any]]:
        self.check_and_update_offline_workers()
        workers = firebase_service.query_collection("workers", order_by="registeredAt", descending=True)
        # Inject live Key Bank cloud workers
        try:
            from app.services.key_bank_service import key_bank_service
            if key_bank_service.has_active_keys():
                bank_keys = key_bank_service.get_bank_status()
                for k in bank_keys:
                    workers.append({
                        "workerId": f"bank-{k['provider']}-{k['key_id']}",
                        "modelId": "cyrus" if k["provider"] == "groq" else ("cyran" if k["provider"] == "cloudflare" else "cyrus"),
                        "provider": f"{k['provider'].upper()} Key Bank",
                        "status": "online" if k["status"] == "active" else "degraded",
                        "registeredAt": utc_iso_now(),
                        "lastHeartbeat": utc_iso_now(),
                        "completedJobs": k["success_count"],
                        "failedJobs": k["failure_count"],
                        "totalJobs": k["success_count"] + k["failure_count"],
                        "gpuName": f"Cloud Engine ({k['masked_key']})"
                    })
        except Exception as e:
            logger.warning(f"Failed to append key bank workers: {e}")
        return workers

    def list_worker_events(self, worker_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        filters = [("workerId", "==", worker_id)] if worker_id else None
        return firebase_service.query_collection("worker_events", filters=filters, order_by="createdAt", descending=True, limit=limit)


worker_service = WorkerService()
