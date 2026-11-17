from typing import Optional, Dict, Any
from pydantic import BaseModel


class JobPayload(BaseModel):
    model: str
    messages: list
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1024
    stream: Optional[bool] = False


class JobClaimResponse(BaseModel):
    job_id: str
    model_id: str
    payload: Dict[str, Any]
    priority: int
    lease_expires_at: str


class JobCompleteRequest(BaseModel):
    result: Dict[str, Any]
    input_tokens: Optional[int] = 0
    output_tokens: Optional[int] = 0
    latency_ms: Optional[float] = 0.0


class JobFailRequest(BaseModel):
    error: str
    can_retry: bool = True


class JobResponse(BaseModel):
    jobId: str
    userId: str
    apiKeyId: Optional[str] = None
    modelId: str
    status: str
    assignedWorkerId: Optional[str] = None
    priority: int = 1
    createdAt: str
    assignedAt: Optional[str] = None
    completedAt: Optional[str] = None
    leaseExpiresAt: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    retryCount: int = 0
