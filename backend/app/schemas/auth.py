from typing import Optional
from pydantic import BaseModel, EmailStr


class UserSession(BaseModel):
    uid: str
    email: Optional[str] = None
    role: str = "user"
    account_status: str = "active"
    subscription_plan: str = "STARTER"
    subscription_status: str = "active"


class UserProfileUpdate(BaseModel):
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
