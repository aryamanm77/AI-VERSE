from typing import Optional, List
from pydantic import BaseModel


class ModelInfo(BaseModel):
    id: str  # "cyrus", "cyran"
    object: str = "model"
    created: int = 1700000000
    owned_by: str = "ai-verse"
    display_name: str
    description: str
    category: str
    enabled: bool = True
    context_window: int = 8192
    allowed_tiers: List[str]


class ModelListResponse(BaseModel):
    object: str = "list"
    data: List[ModelInfo]
