from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.models import ModelListResponse, ModelInfo
from app.services.model_service import model_service

router = APIRouter(prefix="/v1/models", tags=["Models (OpenAI Compatible)"])


@router.get("", response_model=ModelListResponse)
async def list_models():
    """Lists all available AI models supported on AI VERSE (CYRUS, CYRAN)."""
    models = model_service.list_models()
    return {
        "object": "list",
        "data": models
    }


@router.get("/{model_id}", response_model=ModelInfo)
async def get_model(model_id: str):
    """Retrieves details for a specific model."""
    m = model_service.get_model(model_id)
    if not m:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")
    return m
