from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from app.services.firebase_service import firebase_service
from app.services.auth_service import auth_service
from app.utils.logging import setup_logger

logger = setup_logger("firebase_auth")
security = HTTPBearer(auto_error=False)


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """
    Authenticates requests using Firebase ID Token.
    Extracts UID, verifies token with Firebase Admin SDK, loads user profile.
    Rejects suspended or disabled users.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token."
        )

    raw_token = credentials.credentials
    decoded = firebase_service.verify_firebase_id_token(raw_token)
    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token."
        )

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase token missing uid."
        )

    user = auth_service.get_or_create_user(
        uid=uid,
        email=decoded.get("email"),
        display_name=decoded.get("name")
    )

    account_status = user.get("accountStatus", "active")
    if account_status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact support."
        )
    if account_status == "disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been disabled."
        )

    return user
