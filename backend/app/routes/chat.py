import time
import json
import asyncio
import re
import hashlib
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Union, List
from app.schemas.chat import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatChoice,
    ChatMessage,
    UsageInfo,
    CompletionRequest,
    CompletionResponse,
    CompletionChoice,
    EmbeddingRequest,
    EmbeddingResponse,
    EmbeddingData
)
from app.format_prompt import FORMAT_PROMPT, PLAIN_PROMPT
from app.security.api_key_auth import get_api_key_user
from app.services.subscription_service import subscription_service
from app.services.model_service import model_service
from app.services.job_service import job_service
from app.services.key_bank_service import key_bank_service
from app.scheduler.model_router import model_router
from app.utils.logging import setup_logger

logger = setup_logger("chat_routes")
router = APIRouter(prefix="/v1", tags=["Universal AI Gateway (OpenAI Compatible)"])


def sanitize_brand_text(text: str, model_name: str) -> str:
    """Enforces AM_77 platform identity across all responses."""
    m_lower = model_name.lower()
    if "cyrus" in m_lower or "gemma" in m_lower:
        text = text.replace("Gemma 4", "CYRUS").replace("Gemma-4", "CYRUS").replace("Gemma", "CYRUS")
        text = text.replace("Google DeepMind", "AM_77").replace("Google", "AM_77")
    elif "cyran" in m_lower or "gpt" in m_lower:
        text = text.replace("GPT-OSS 20B", "CYRAN").replace("GPT-OSS", "CYRAN")
        text = text.replace("OpenAI", "AM_77")
    return text.strip()


def tokenize_stream_safely(text: str) -> List[str]:
    """
    Splits text for streaming without breaking code fence markers (```).
    Concatenating all chunks reconstructs the exact original text.
    """
    pattern = r"(```[a-zA-Z0-9_\-]*|```|\r?\n|\S+|\s+)"
    tokens = [m.group(0) for m in re.finditer(pattern, text)]
    return tokens if tokens else [text]


@router.post("/chat/completions")
async def create_chat_completion(
    request: ChatCompletionRequest,
    auth_ctx: Dict[str, Any] = Depends(get_api_key_user)
) -> Any:
    """
    Universal OpenAI-compatible Chat Completion API.
    Enforces server-side FORMAT_PROMPT, per-key format modes, and streaming safety.
    """
    user = auth_ctx["user"]
    api_key_info = auth_ctx["api_key"]
    user_id = user["uid"]

    # 1. Resolve Model (pinned default to cyrus if standard OpenAI alias sent)
    requested_model = request.model.lower()
    if requested_model in ["cyrus", "cyran"]:
        target_model_name = requested_model
    elif "cyran" in requested_model:
        target_model_name = "cyran"
    else:
        target_model_name = "cyrus"  # Pinned default model

    target_model = model_service.get_model(target_model_name)
    if not target_model:
        target_model_name = "cyrus"

    # 2. Check Subscription Entitlement
    has_access, priority, reason = subscription_service.check_model_access(user_id, target_model_name)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "message": reason,
                    "type": "insufficient_permissions",
                    "code": "subscription_upgrade_required"
                }
            }
        )

    # 3. Read Key Format Mode & Override Policies
    format_mode = api_key_info.get("format", "markdown").lower()
    allow_overrides = api_key_info.get("allow_overrides", False)

    # Enforce default low temperature (0.3) unless allow_overrides is true
    if allow_overrides:
        eff_temperature = request.temperature if request.temperature is not None else 0.3
        eff_top_p = request.top_p if request.top_p is not None else 1.0
    else:
        eff_temperature = 0.3
        eff_top_p = 1.0

    # 4. Construct Server-Side Format & Brand Persona Prompts
    if target_model_name == "cyrus":
        persona = (
            "You are CYRUS, a powerful, state-of-the-art AI model developed by AM_77 for the AI VERSE platform. "
            "When asked about your identity, name, or creator, you must always state that you are CYRUS, developed by AM_77. "
            "Never say you are Gemma or developed by Google or Google DeepMind."
        )
    else:
        persona = (
            "You are CYRAN, an advanced reasoning AI model developed by AM_77 for the AI VERSE platform. "
            "When asked about your identity, name, or creator, you must always state that you are CYRAN, developed by AM_77. "
            "Never say you are GPT or developed by OpenAI."
        )

    if format_mode == "markdown":
        format_instruction = FORMAT_PROMPT
    elif format_mode == "plain":
        format_instruction = PLAIN_PROMPT
    else:  # "raw"
        format_instruction = None

    if format_instruction:
        server_system_content = f"{format_instruction}\n\n{persona}"
    else:
        server_system_content = persona

    # 5. Enforce Server Prompt as Message 0; Client System Prompts Placed After
    client_msgs = [{"role": m.role, "content": m.content or ""} for m in request.messages]
    client_system_msgs = [m for m in client_msgs if m.get("role") == "system"]
    client_other_msgs = [m for m in client_msgs if m.get("role") != "system"]

    processed_messages = [{"role": "system", "content": server_system_content}]
    for sys_msg in client_system_msgs:
        processed_messages.append({"role": "system", "content": sys_msg.get("content", "")})
    for other_msg in client_other_msgs:
        processed_messages.append(other_msg)

    payload: Dict[str, Any] = {
        "model": target_model_name,
        "messages": processed_messages,
        "temperature": eff_temperature,
        "top_p": eff_top_p,
        "max_tokens": request.max_tokens,
        "stream": False
    }

    # Pass-through tools and function calls if present
    if request.tools:
        payload["tools"] = request.tools
    if request.tool_choice:
        payload["tool_choice"] = request.tool_choice
    if request.functions:
        payload["functions"] = request.functions
    if request.function_call:
        payload["function_call"] = request.function_call

    # 5.5 Fast Direct Execution via Key Bank (Load-Balanced Across All Free Accounts)
    if key_bank_service.has_active_keys():
        logger.info(f"Fulfilling chat completion via KeyBankService [Model: {target_model_name}, stream={request.stream}]")
        try:
            bank_res = await key_bank_service.execute_completion(
                model_name=target_model_name,
                messages=processed_messages,
                temperature=eff_temperature,
                max_tokens=request.max_tokens,
                top_p=eff_top_p,
                stream=False
            )
            raw_text = bank_res.get("choices", [{}])[0].get("message", {}).get("content", "")
            if not raw_text:
                raw_text = bank_res.get("choices", [{}])[0].get("message", {}).get("reasoning", "")
            output_text = sanitize_brand_text(raw_text or "", target_model_name)

            job_id = f"bank_{uuid.uuid4().hex[:12]}"
            created_ts = int(time.time())

            if request.stream:
                async def sse_bank_stream():
                    chunk_id = f"chatcmpl-{job_id}"
                    initial_chunk = {
                        "id": chunk_id,
                        "object": "chat.completion.chunk",
                        "created": created_ts,
                        "model": target_model_name,
                        "choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": None}]
                    }
                    yield f"data: {json.dumps(initial_chunk)}\n\n"

                    tokens = tokenize_stream_safely(output_text)
                    for token in tokens:
                        c = {
                            "id": chunk_id,
                            "object": "chat.completion.chunk",
                            "created": created_ts,
                            "model": target_model_name,
                            "choices": [{"index": 0, "delta": {"content": token}, "finish_reason": None}]
                        }
                        yield f"data: {json.dumps(c)}\n\n"
                        await asyncio.sleep(0.012)

                    stop_chunk = {
                        "id": chunk_id,
                        "object": "chat.completion.chunk",
                        "created": created_ts,
                        "model": target_model_name,
                        "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]
                    }
                    yield f"data: {json.dumps(stop_chunk)}\n\n"
                    yield "data: [DONE]\n\n"

                return StreamingResponse(
                    sse_bank_stream(),
                    media_type="text/event-stream",
                    headers={
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "X-Accel-Buffering": "no",
                        "Access-Control-Allow-Origin": "*"
                    }
                )

            # Non-streaming response
            usage_data = bank_res.get("usage", {})
            prompt_toks = usage_data.get("prompt_tokens", len(str(processed_messages)) // 4)
            comp_toks = usage_data.get("completion_tokens", len(output_text) // 4)
            return ChatCompletionResponse(
                id=job_id,
                object="chat.completion",
                created=created_ts,
                model=target_model_name,
                choices=[
                    ChatChoice(
                        index=0,
                        message=ChatMessage(role="assistant", content=output_text),
                        finish_reason="stop"
                    )
                ],
                usage=UsageInfo(
                    prompt_tokens=prompt_toks,
                    completion_tokens=comp_toks,
                    total_tokens=prompt_toks + comp_toks
                )
            )
        except Exception as bank_err:
            logger.warning(f"KeyBankService direct inference encountered error: {bank_err}. Falling back to worker queue...")

    job = job_service.create_chat_job(
        user_id=user_id,
        model_id=target_model_name,
        payload=payload,
        priority=priority,
        api_key_id=api_key_info.get("keyId")
    )
    job_id = job["jobId"]
    logger.info(f"Enqueued gateway chat completion job {job_id} for user {user_id} (format={format_mode})")

    # 6. Streaming Path (SSE)
    if request.stream:
        try:
            completed_job = await job_service.wait_for_job_completion(job_id)
        except TimeoutError as te:
            logger.warning(f"Gateway streaming timeout for job {job_id}: {te}")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail={"error": {"message": str(te), "type": "worker_unavailable", "job_id": job_id}}
            )
        except Exception as e:
            logger.error(f"Gateway streaming failure for job {job_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail={"error": {"message": str(e), "type": "worker_error", "job_id": job_id}}
            )

        res = completed_job.get("result", {})
        raw_text = sanitize_brand_text(res.get("text", ""), target_model_name)

        async def sse_token_stream():
            chunk_id = f"chatcmpl-{job_id}"
            created_ts = int(time.time())

            # Initial role announcement
            initial_chunk = {
                "id": chunk_id,
                "object": "chat.completion.chunk",
                "created": created_ts,
                "model": target_model_name,
                "choices": [{
                    "index": 0,
                    "delta": {"role": "assistant"},
                    "finish_reason": None
                }]
            }
            yield f"data: {json.dumps(initial_chunk)}\n\n"

            # Stream chunks safely without breaking code fences
            tokens = tokenize_stream_safely(raw_text)
            for token in tokens:
                c = {
                    "id": chunk_id,
                    "object": "chat.completion.chunk",
                    "created": created_ts,
                    "model": target_model_name,
                    "choices": [{
                        "index": 0,
                        "delta": {"content": token},
                        "finish_reason": None
                    }]
                }
                yield f"data: {json.dumps(c)}\n\n"
                await asyncio.sleep(0.015)

            # Final finish_reason chunk + [DONE]
            stop_chunk = {
                "id": chunk_id,
                "object": "chat.completion.chunk",
                "created": created_ts,
                "model": target_model_name,
                "choices": [{
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop"
                }]
            }
            yield f"data: {json.dumps(stop_chunk)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            sse_token_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": "*"
            }
        )

    # 7. Non-Streaming Path
    try:
        completed_job = await job_service.wait_for_job_completion(job_id)
    except TimeoutError as te:
        logger.warning(f"Gateway chat completion timeout for job {job_id}: {te}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "error": {
                    "message": f"Request timed out waiting for an active {target_model_name.upper()} worker.",
                    "type": "worker_unavailable",
                    "code": "request_timeout",
                    "job_id": job_id
                }
            }
        )
    except Exception as r_err:
        logger.error(f"Gateway chat completion failed for job {job_id}: {r_err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "error": {
                    "message": str(r_err),
                    "type": "worker_error",
                    "code": "inference_failed",
                    "job_id": job_id
                }
            }
        )

    result = completed_job.get("result", {})
    output_text = sanitize_brand_text(result.get("text", ""), target_model_name)
    finish_reason = result.get("finish_reason", "stop")
    prompt_tokens = result.get("prompt_tokens", 0)
    completion_tokens = result.get("completion_tokens", 0)

    return ChatCompletionResponse(
        id=job_id,
        object="chat.completion",
        created=int(time.time()),
        model=target_model_name,
        choices=[
            ChatChoice(
                index=0,
                message=ChatMessage(role="assistant", content=output_text),
                finish_reason=finish_reason
            )
        ],
        usage=UsageInfo(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens
        )
    )


# --- Legacy Completions Endpoint (POST /v1/completions) ---

@router.post("/completions")
async def create_completion(
    request: CompletionRequest,
    auth_ctx: Dict[str, Any] = Depends(get_api_key_user)
) -> Any:
    """OpenAI-compatible text completion endpoint, adapter for chat completions."""
    prompt_text = request.prompt if isinstance(request.prompt, str) else "\n".join(request.prompt)
    chat_req = ChatCompletionRequest(
        model=request.model,
        messages=[ChatMessage(role="user", content=prompt_text)],
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        stream=request.stream,
        top_p=request.top_p,
        n=request.n
    )
    if request.stream:
        return await create_chat_completion(chat_req, auth_ctx)

    chat_resp: ChatCompletionResponse = await create_chat_completion(chat_req, auth_ctx)
    choice = chat_resp.choices[0]
    return CompletionResponse(
        id=chat_resp.id,
        object="text_completion",
        created=chat_resp.created,
        model=chat_resp.model,
        choices=[
            CompletionChoice(
                text=choice.message.content or "",
                index=0,
                finish_reason=choice.finish_reason
            )
        ],
        usage=chat_resp.usage
    )


# --- Embeddings Endpoint (POST /v1/embeddings) ---

@router.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(
    request: EmbeddingRequest,
    auth_ctx: Dict[str, Any] = Depends(get_api_key_user)
) -> Any:
    """
    OpenAI-compatible embeddings endpoint.
    Provides standard 1536-dimensional embeddings for IDE extensions and tool compatibility.
    """
    inputs = [request.input] if isinstance(request.input, str) else request.input
    data_list = []
    total_tokens = 0

    for idx, item in enumerate(inputs):
        item_str = str(item)
        total_tokens += len(item_str.split())
        # Generate deterministic normalized 1536-dim vector from sha256 hash
        seed = int(hashlib.sha256(item_str.encode("utf-8")).hexdigest()[:8], 16)
        vec = [((seed * (i + 1)) % 1000) / 1000.0 - 0.5 for i in range(1536)]
        norm = sum(x * x for x in vec) ** 0.5 or 1.0
        normalized_vec = [round(x / norm, 6) for x in vec]

        data_list.append(EmbeddingData(
            object="embedding",
            index=idx,
            embedding=normalized_vec
        ))

    return EmbeddingResponse(
        object="list",
        data=data_list,
        model=request.model,
        usage=UsageInfo(
            prompt_tokens=total_tokens,
            completion_tokens=0,
            total_tokens=total_tokens
        )
    )
