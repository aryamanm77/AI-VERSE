from typing import Optional, Any, Dict
from pydantic import BaseModel, Field


class WorkerRegisterRequest(BaseModel):
    worker_id: str
    model_id: str  # "CYRUS" or "CYRAN"
    provider: str  # "Google Colab", "Kaggle", "Local"
    worker_version: str = "1.0.0"


class WorkerAdminCreateRequest(BaseModel):
    worker_id: str = Field(..., min_length=3, max_length=64)
    model_id: str  # "CYRUS" or "CYRAN"
    provider: str  # "Google Colab" or "Kaggle"
    description: Optional[str] = None


class WorkerCreatedResponse(BaseModel):
    worker_id: str
    model_id: str
    provider: str
    token: str  # DISPLAYED ONLY ONCE TO ADMIN
    status: str
    registered_at: str


class WorkerHeartbeatRequest(BaseModel):
    worker_id: str
    status: str  # online, busy, error
    gpu_name: Optional[str] = "None"
    gpu_memory: Optional[int] = 0  # MB
    available_memory: Optional[int] = 0
    current_job_id: Optional[str] = None
    error_message: Optional[str] = None


class WorkerHeartbeatResponse(BaseModel):
    acknowledged: bool = True
    server_time: str
    action: Optional[str] = None  # e.g. "continue", "shutdown"


class WorkerResponse(BaseModel):
    workerId: str
    modelId: str
    provider: str
    status: str
    lastHeartbeat: Optional[str] = None
    registeredAt: str
    updatedAt: Optional[str] = None
    currentJobId: Optional[str] = None
    gpuName: Optional[str] = None
    gpuMemory: Optional[int] = 0
    availableMemory: Optional[int] = 0
    runtimeVersion: Optional[str] = None
    workerVersion: Optional[str] = None
    completedJobs: int = 0
    failedJobs: int = 0
    totalJobs: int = 0
    lastError: Optional[str] = None
    disabledAt: Optional[str] = None
