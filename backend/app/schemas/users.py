from typing import Optional, List
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    uid: str
    displayName: Optional[str] = None
    email: Optional[str] = None
    photoURL: Optional[str] = None
    role: str = "user"
    accountStatus: str = "active"
    subscriptionPlan: str = "STARTER"
    subscriptionStatus: str = "active"
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    emailVerified: bool = False


class UserStatusUpdate(BaseModel):
    accountStatus: str  # active, suspended, disabled


class UserRoleUpdate(BaseModel):
    role: str  # user, admin
