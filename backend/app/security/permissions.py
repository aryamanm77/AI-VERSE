from fastapi import Depends, HTTPException, status
from typing import Dict, Any
from app.security.firebase_auth import get_current_user


async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Enforces administrator role. Rejects non-admin users with 403 Forbidden.
    """
    role = current_user.get("role", "user")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for this operation."
        )
    return current_user
