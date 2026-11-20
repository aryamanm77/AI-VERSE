from fastapi import APIRouter
from app.services.firebase_service import firebase_service
from app.services.worker_service import worker_service
from app.services.key_bank_service import key_bank_service
from app.utils.datetime_utils import utc_iso_now

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Basic liveness probe."""
    return {
        "status": "healthy",
        "timestamp": utc_iso_now(),
        "service": "AI VERSE Platform"
    }


@router.get("/health/ready")
async def readiness_check():
    """Readiness probe checking database and worker status."""
    offline_workers = worker_service.check_and_update_offline_workers()
    return {
        "ready": True,
        "database": "mock_mode" if firebase_service.is_mock else "connected",
        "timestamp": utc_iso_now()
    }


@router.get("/api/system/status")
async def system_status():
    """Public system status overview (no sensitive infrastructure details)."""
    workers = worker_service.list_workers()
    online_cyrus = sum(1 for w in workers if w.get("modelId") == "CYRUS" and w.get("status") in {"online", "busy"})
    online_cyran = sum(1 for w in workers if w.get("modelId") == "CYRAN" and w.get("status") in {"online", "busy"})

    bank_active = key_bank_service.has_active_keys()
    active_bank_keys = key_bank_service.active_keys_count()

    effective_cyrus_online = online_cyrus > 0 or bank_active
    effective_cyran_online = online_cyran > 0 or bank_active

    return {
        "status": "operational",
        "models": {
            "cyrus": {
                "available": effective_cyrus_online,
                "online_workers": max(online_cyrus, active_bank_keys if bank_active else 0)
            },
            "cyran": {
                "available": effective_cyran_online,
                "online_workers": max(online_cyran, active_bank_keys if bank_active else 0)
            }
        },
        "key_bank": {
            "enabled": bank_active,
            "total_keys": key_bank_service.total_keys_count(),
            "active_keys": active_bank_keys
        },
        "server_time": utc_iso_now()
    }
