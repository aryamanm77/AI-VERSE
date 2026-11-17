from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.schemas.api_keys import CreateApiKeyRequest, ApiKeyCreatedResponse, ApiKeyItem
from app.security.firebase_auth import get_current_user
from app.services.api_key_service import api_key_service

router = APIRouter(prefix="/api/keys", tags=["API Keys"])


@router.post("", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_new_api_key(
    body: CreateApiKeyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generates a cryptographically random AI VERSE API key.
    IMPORTANT: The complete plaintext API key is returned ONLY ONCE in this response.
    The backend stores only a HMAC-SHA256 hash.
    """
    key_doc, raw_key = api_key_service.create_api_key(
        user_id=current_user["uid"],
        name=body.name
    )
    return {
        "keyId": key_doc["keyId"],
        "name": key_doc["name"],
        "apiKey": raw_key,
        "keyPrefix": key_doc["keyPrefix"],
        "createdAt": key_doc["createdAt"],
        "status": key_doc["status"]
    }


@router.get("", response_model=List[ApiKeyItem])
async def list_my_api_keys(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Lists metadata for all API keys created by the current user."""
    return api_key_service.list_user_api_keys(current_user["uid"])


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Revokes an API key. Once revoked, requests using this key will immediately be rejected."""
    success = api_key_service.revoke_api_key(current_user["uid"], key_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found or does not belong to the user."
        )
    return {"status": "success", "message": f"API key {key_id} has been revoked."}
