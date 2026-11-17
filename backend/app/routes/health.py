from fastapi import APIRouter
from app.services.firebase_service import firebase_service
from app.services.worker_service import worker_service
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

    return {
        "status": "operational",
        "models": {
            "cyrus": {
                "available": online_cyrus > 0,
                "online_workers": online_cyrus
            },
            "cyran": {
                "available": online_cyran > 0,
                "online_workers": online_cyran
            }
        },
        "server_time": utc_iso_now()
    }
