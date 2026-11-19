from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    role: str  # "system", "user", "assistant", "tool", "function"
    content: Optional[str] = ""
    name: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None


class ChatCompletionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    model: str  # "cyrus" or "cyran"
    messages: List[ChatMessage]
    temperature: Optional[float] = Field(default=0.3, ge=0.0, le=2.0)
    top_p: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)
    n: Optional[int] = Field(default=1, ge=1)
    max_tokens: Optional[int] = Field(default=1024, ge=1, le=4096)
    stream: Optional[bool] = False
    tools: Optional[List[Dict[str, Any]]] = None
    tool_choice: Optional[Any] = None
    functions: Optional[List[Dict[str, Any]]] = None
    function_call: Optional[Any] = None
    stop: Optional[Union[str, List[str]]] = None
    user: Optional[str] = None


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


# --- Legacy / Text Completion Schemas (POST /v1/completions) ---

class CompletionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    model: str = "cyrus"
    prompt: Union[str, List[str]]
    temperature: Optional[float] = Field(default=0.3, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=1024, ge=1, le=4096)
    stream: Optional[bool] = False
    top_p: Optional[float] = 1.0
    n: Optional[int] = 1
    stop: Optional[Union[str, List[str]]] = None
    user: Optional[str] = None


class CompletionChoice(BaseModel):
    text: str
    index: int = 0
    logprobs: Optional[Any] = None
    finish_reason: str = "stop"


class CompletionResponse(BaseModel):
    id: str
    object: str = "text_completion"
    created: int
    model: str
    choices: List[CompletionChoice]
    usage: UsageInfo


# --- Embeddings Schemas (POST /v1/embeddings) ---

class EmbeddingRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    model: str = "text-embedding-3-small"
    input: Union[str, List[str], List[int], List[List[int]]]
    user: Optional[str] = None


class EmbeddingData(BaseModel):
    object: str = "embedding"
    index: int
    embedding: List[float]


class EmbeddingResponse(BaseModel):
    object: str = "list"
    data: List[EmbeddingData]
    model: str
    usage: UsageInfo
