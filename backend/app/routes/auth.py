from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.schemas.auth import UserProfileUpdate
from app.schemas.users import UserResponse
from app.security.firebase_auth import get_current_user
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Fetches currently authenticated user's profile and subscription entitlement."""
    return current_user


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    body: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Updates permitted profile fields (displayName, photoURL)."""
    updated = auth_service.update_user_profile(current_user["uid"], body.model_dump())
    return updated
