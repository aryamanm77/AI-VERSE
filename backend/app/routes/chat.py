import time
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.schemas.chat import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatChoice,
    ChatMessage,
    UsageInfo
)
from app.security.api_key_auth import get_api_key_user
from app.services.subscription_service import subscription_service
from app.services.model_service import model_service
from app.services.job_service import job_service
from app.scheduler.model_router import model_router
from app.utils.logging import setup_logger

logger = setup_logger("chat_routes")
router = APIRouter(prefix="/v1", tags=["Chat Completions (OpenAI Compatible)"])


@router.post("/chat/completions", response_model=ChatCompletionResponse)
async def create_chat_completion(
    request: ChatCompletionRequest,
    auth_ctx: Dict[str, Any] = Depends(get_api_key_user)
):
    """
    OpenAI-compatible Chat Completion API.
    Routes prompts to Google Colab (CYRUS) or Kaggle (CYRAN) workers.
    Returns real model output from the worker execution.
    """
    if request.stream:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Streaming is currently not supported for notebook worker architecture. Please set stream=false."
        )

    user = auth_ctx["user"]
    api_key_info = auth_ctx["api_key"]
    user_id = user["uid"]

    # 1. Validate Model
    target_model = model_service.get_model(request.model)
    if not target_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "message": f"Model '{request.model}' does not exist. Available models: cyrus, cyran",
                    "type": "model_not_found",
                    "code": "invalid_model"
                }
            }
        )

    # 2. Check Subscription Entitlement
    has_access, priority, reason = subscription_service.check_model_access(user_id, request.model)
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

    # 3. Create Queue Job with AM_77 Platform Persona
    canonical_model = request.model.lower()
    if canonical_model == "cyrus":
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

    raw_msgs = [m.model_dump() for m in request.messages]
    has_system = any(m.get("role") == "system" for m in raw_msgs)
    if not has_system:
        processed_messages = [{"role": "system", "content": persona}] + raw_msgs
    else:
        processed_messages = []
        for m in raw_msgs:
            if m.get("role") == "system":
                processed_messages.append({"role": "system", "content": f"{persona}\n\n{m.get('content', '')}"})
            else:
                processed_messages.append(m)

    payload = {
        "model": canonical_model,
        "messages": processed_messages,
        "temperature": request.temperature,
        "max_tokens": request.max_tokens,
        "stream": False
    }

    job = job_service.create_chat_job(
        user_id=user_id,
        model_id=request.model,
        payload=payload,
        priority=priority,
        api_key_id=api_key_info.get("keyId")
    )

    job_id = job["jobId"]
    logger.info(f"Enqueued chat completion job {job_id} for user {user_id} with priority {priority}")

    # 4. Await Worker Processing
    try:
        completed_job = await job_service.wait_for_job_completion(job_id)
    except TimeoutError as te:
        logger.warning(f"Chat completion timeout for job {job_id}: {te}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "error": {
                    "message": f"Request timed out waiting for an active {request.model.upper()} worker. Please ensure your worker notebook is online and polling.",
                    "type": "worker_unavailable",
                    "code": "request_timeout",
                    "job_id": job_id
                }
            }
        )
    except RuntimeError as re:
        logger.error(f"Chat completion failed for job {job_id}: {re}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "error": {
                    "message": str(re),
                    "type": "worker_error",
                    "code": "inference_failed",
                    "job_id": job_id
                }
            }
        )

    # 5. Extract Worker Result & Sanitize AM_77 Brand Identity
    result = completed_job.get("result", {})
    output_text = result.get("text", "")
    if canonical_model == "cyrus":
        output_text = output_text.replace("Gemma 4", "CYRUS").replace("Gemma-4", "CYRUS").replace("Gemma", "CYRUS")
        output_text = output_text.replace("Google DeepMind", "AM_77").replace("Google", "AM_77")
    elif canonical_model == "cyran":
        output_text = output_text.replace("GPT-OSS 20B", "CYRAN").replace("GPT-OSS", "CYRAN")
        output_text = output_text.replace("OpenAI", "AM_77")
    output_text = output_text.strip()
    finish_reason = result.get("finish_reason", "stop")
    prompt_tokens = result.get("prompt_tokens", 0)
    completion_tokens = result.get("completion_tokens", 0)
    total_tokens = prompt_tokens + completion_tokens

    return ChatCompletionResponse(
        id=job_id,
        object="chat.completion",
        created=int(time.time()),
        model=request.model.lower(),
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
            total_tokens=total_tokens
        )
    )
