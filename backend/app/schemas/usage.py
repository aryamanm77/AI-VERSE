from typing import Optional, List, Dict
from pydantic import BaseModel


class UsageRecordItem(BaseModel):
    requestId: str
    userId: str
    modelId: str
    promptTokens: int
    completionTokens: int
    totalTokens: int
    latencyMs: float
    timestamp: str


class UsageSummaryResponse(BaseModel):
    totalRequests: int
    successfulRequests: int
    failedRequests: int
    totalTokens: int
    promptTokens: int
    completionTokens: int
    averageLatencyMs: float
    modelBreakdown: Dict[str, int]
