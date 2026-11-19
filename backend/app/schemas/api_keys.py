from typing import Optional
from pydantic import BaseModel, Field


class CreateApiKeyRequest(BaseModel):
    name: str = Field(default="Default Key", min_length=1, max_length=64)
    format: str = Field(default="markdown", description="Format mode: 'markdown', 'plain', or 'raw'")
    allow_overrides: bool = Field(default=False, description="Whether to allow client temperature/top_p overrides")


class ApiKeyCreatedResponse(BaseModel):
    keyId: str
    name: str
    apiKey: str  # ONLY RETURNED ONCE UPON CREATION
    keyPrefix: str
    format: str = "markdown"
    allow_overrides: bool = False
    createdAt: str
    status: str = "active"


class ApiKeyItem(BaseModel):
    keyId: str
    name: str
    keyPrefix: str
    format: str = "markdown"
    allow_overrides: bool = False
    status: str
    createdAt: str
    lastUsedAt: Optional[str] = None
    revokedAt: Optional[str] = None
