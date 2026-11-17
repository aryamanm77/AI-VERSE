from typing import List, Dict, Any, Optional
from app.services.firebase_service import firebase_service
from app.utils.validation import normalize_model_id
from app.utils.logging import setup_logger

logger = setup_logger("model_router")


class ModelRouter:
    """
    Directs incoming requests to workers strictly matching the requested model family.
    Guarantees no cross-model routing (CYRUS only to CYRUS workers, CYRAN only to CYRAN workers).
    """

    @staticmethod
    def get_target_model_family(requested_model: str) -> str:
        """Maps user model string ('cyrus' or 'cyran') to canonical internal model family ('CYRUS', 'CYRAN')."""
        normalized = normalize_model_id(requested_model)
        if normalized == "cyrus":
            return "CYRUS"
        elif normalized == "cyran":
            return "CYRAN"
        raise ValueError(f"Unroutable model identifier: {requested_model}")

    @staticmethod
    def find_active_workers_for_model(model_family: str) -> List[Dict[str, Any]]:
        """
        Queries workers capable of serving the given model family that are currently online.
        """
        all_workers = firebase_service.query_collection("workers", filters=[("modelId", "==", model_family)])
        active_workers = [
            w for w in all_workers
            if w.get("status") in {"online", "busy"}
        ]
        return active_workers

    @staticmethod
    def is_worker_compatible(worker_doc: Dict[str, Any], job_model_id: str) -> bool:
        """
        Strict equality check between worker's assigned model family and the job's target model.
        """
        worker_model = (worker_doc.get("modelId") or "").upper()
        target_model = job_model_id.upper()
        return worker_model == target_model


model_router = ModelRouter()
