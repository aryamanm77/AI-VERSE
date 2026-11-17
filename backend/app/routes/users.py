from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.schemas.users import UserResponse, UserStatusUpdate, UserRoleUpdate
from app.security.permissions import require_admin
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/users", tags=["Users Admin"])


@router.get("", response_model=List[UserResponse])
async def list_users(admin: Dict[str, Any] = Depends(require_admin)):
    """Admin-only endpoint to list all platform users."""
    return auth_service.list_users()


@router.patch("/{uid}/status")
async def update_user_status(
    uid: str,
    body: UserStatusUpdate,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Admin-only endpoint to suspend or activate a user account."""
    success = auth_service.set_user_status(uid, body.accountStatus)
    if not success:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": "success", "uid": uid, "accountStatus": body.accountStatus}


@router.patch("/{uid}/role")
async def update_user_role(
    uid: str,
    body: UserRoleUpdate,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """Admin-only endpoint to update a user's role (user/admin)."""
    success = auth_service.set_user_role(uid, body.role)
    if not success:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": "success", "uid": uid, "role": body.role}
