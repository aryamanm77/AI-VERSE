from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.schemas.usage import UsageSummaryResponse
from app.security.firebase_auth import get_current_user
from app.services.usage_service import usage_service
from app.services.firebase_service import firebase_service

router = APIRouter(tags=["Usage & History"])


@router.get("/api/usage/summary", response_model=UsageSummaryResponse)
async def get_user_usage_summary(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns analytics summary for authenticated user."""
    return usage_service.get_user_usage_summary(current_user["uid"])


@router.get("/api/usage/history")
async def get_user_request_history(
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Returns past request history logs for authenticated user."""
    return usage_service.get_user_request_history(current_user["uid"], limit=limit)


@router.get("/v1/usage")
async def get_v1_usage(current_user: Dict[str, Any] = Depends(get_current_user)):
    """OpenAI-compatible usage endpoint."""
    summary = usage_service.get_user_usage_summary(current_user["uid"])
    return {
        "object": "usage",
        "data": summary
    }


@router.get("/v1/requests/{request_id}")
async def get_request_status(
    request_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Fetches details of a specific request for the authenticated user."""
    job = firebase_service.get_document("request_jobs", request_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Request {request_id} not found.")

    if job.get("userId") != current_user["uid"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access to request.")

    return {
        "id": job.get("jobId"),
        "model": job.get("modelId"),
        "status": job.get("status"),
        "created_at": job.get("createdAt"),
        "completed_at": job.get("completedAt"),
        "error": job.get("error")
    }
