from typing import Optional
from pydantic import BaseModel, Field


class CreateApiKeyRequest(BaseModel):
    name: str = Field(default="Default Key", min_length=1, max_length=64)


class ApiKeyCreatedResponse(BaseModel):
    keyId: str
    name: str
    apiKey: str  # ONLY RETURNED ONCE UPON CREATION
    keyPrefix: str
    createdAt: str
    status: str = "active"


class ApiKeyItem(BaseModel):
    keyId: str
    name: str
    keyPrefix: str
    status: str
    createdAt: str
    lastUsedAt: Optional[str] = None
    revokedAt: Optional[str] = None
