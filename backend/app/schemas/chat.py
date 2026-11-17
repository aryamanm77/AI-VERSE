from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str  # "system", "user", "assistant"
    content: str


class ChatCompletionRequest(BaseModel):
    model: str  # "cyrus" or "cyran"
    messages: List[ChatMessage]
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=1024, ge=1, le=4096)
    stream: Optional[bool] = False


class ChatChoice(BaseModel):
    index: int = 0
    message: ChatMessage
    finish_reason: str = "stop"


class UsageInfo(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[ChatChoice]
    usage: UsageInfo
