import time
import os
import asyncio
import uuid
import httpx
import json
from typing import List, Dict, Any, Optional, AsyncGenerator, Union
from app.config import get_settings
from app.services.firebase_service import firebase_service
from app.utils.logging import setup_logger

logger = setup_logger("key_bank_service")

# Pre-seeded bank of keys provided by admin or environment (kept empty in git to satisfy secret scanning)
DEFAULT_GROQ_KEYS: List[str] = []


class KeyRecord:
    def __init__(self, key_id: str, api_key: str, provider: str = "groq", account_id: Optional[str] = None):
        self.key_id = key_id
        self.api_key = api_key.strip()
        self.provider = provider
        self.account_id = account_id
        self.status = "active"  # "active", "cooling_down", "disabled"
        self.cooldown_until: float = 0.0
        self.success_count: int = 0
        self.failure_count: int = 0
        self.last_used_at: float = 0.0
        self.last_error: Optional[str] = None

    @property
    def masked_key(self) -> str:
        k = self.api_key
        if len(k) > 12:
            return f"{k[:7]}...{k[-4:]}"
        return "***"

    def is_available(self) -> bool:
        if self.status == "disabled":
            return False
        if self.status == "cooling_down":
            if time.time() >= self.cooldown_until:
                self.status = "active"
                self.cooldown_until = 0.0
                return True
            return False
        return True

    def mark_cooling(self, cooldown_seconds: int = 60, reason: str = ""):
        self.status = "cooling_down"
        self.cooldown_until = time.time() + cooldown_seconds
        self.failure_count += 1
        self.last_error = reason
        logger.warning(f"Key {self.masked_key} ({self.provider}) placed in cooldown for {cooldown_seconds}s. Reason: {reason}")

    def mark_success(self):
        self.status = "active"
        self.cooldown_until = 0.0
        self.success_count += 1
        self.last_used_at = time.time()
        self.last_error = None


class KeyBankService:
    """
    High-availability Key Bank and Smart Load Balancer.
    Pools multiple provider API keys (Groq, Cloudflare Workers AI, NVIDIA NIM),
    balances load across them round-robin, and automatically fails over
    when any key experiences rate limits (HTTP 429) or transient provider errors.
    """

    def __init__(self):
        self.settings = get_settings()
        self._keys: List[KeyRecord] = []
        self._lock = asyncio.Lock()
        self._rotation_idx = 0
        self._initialize_keys()

    def _initialize_keys(self):
        seen_keys = set()

        def add_single_key(raw_key: str, force_provider: Optional[str] = None, account_id: Optional[str] = None):
            k = raw_key.strip()
            if k and k not in seen_keys and len(k) > 10:
                seen_keys.add(k)
                if force_provider:
                    provider = force_provider
                elif k.startswith("nvapi-"):
                    provider = "nvidia"
                elif k.startswith("cfut_"):
                    provider = "cloudflare"
                else:
                    provider = "groq"
                
                acct = account_id or (self.settings.CLOUDFLARE_ACCOUNT_ID if provider == "cloudflare" else None)
                record = KeyRecord(
                    key_id=f"kb_{uuid.uuid4().hex[:8]}",
                    api_key=k,
                    provider=provider,
                    account_id=acct
                )
                self._keys.append(record)

        # 1. Load Groq keys from environment
        env_keys_str = self.settings.KEY_BANK_GROQ_KEYS or ""
        if env_keys_str:
            for k in env_keys_str.split(","):
                add_single_key(k, force_provider="groq")

        if self.settings.GROQ_API_KEY:
            add_single_key(self.settings.GROQ_API_KEY, force_provider="groq")

        # 2. Load Cloudflare Workers AI tokens from environment
        cf_keys_str = self.settings.KEY_BANK_CLOUDFLARE_KEYS or ""
        if cf_keys_str:
            for k in cf_keys_str.split(","):
                add_single_key(k, force_provider="cloudflare", account_id=self.settings.CLOUDFLARE_ACCOUNT_ID)

        if self.settings.CLOUDFLARE_API_KEY:
            add_single_key(self.settings.CLOUDFLARE_API_KEY, force_provider="cloudflare", account_id=self.settings.CLOUDFLARE_ACCOUNT_ID)

        # 3. Load NVIDIA NIM keys from environment
        nv_keys_str = self.settings.KEY_BANK_NVIDIA_KEYS or ""
        if nv_keys_str:
            for k in nv_keys_str.split(","):
                add_single_key(k, force_provider="nvidia")

        if self.settings.NVIDIA_API_KEY:
            add_single_key(self.settings.NVIDIA_API_KEY, force_provider="nvidia")

        # 4. Seed with defaults in production or when explicitly enabled in tests
        if self.settings.APP_ENV != "testing" or os.environ.get("ENABLE_KEY_BANK_TESTS"):
            for dk in DEFAULT_GROQ_KEYS:
                add_single_key(dk, force_provider="groq")

        logger.info(f"KeyBankService initialized with {len(self._keys)} active keys across Groq, Cloudflare, and NVIDIA.")

    def add_key(self, api_key: str, provider: Optional[str] = None, account_id: Optional[str] = None) -> KeyRecord:
        k = api_key.strip()
        if not provider:
            if k.startswith("nvapi-"):
                provider = "nvidia"
            elif k.startswith("cfut_"):
                provider = "cloudflare"
            else:
                provider = "groq"
        acct = account_id or (self.settings.CLOUDFLARE_ACCOUNT_ID if provider == "cloudflare" else None)
        record = KeyRecord(key_id=f"kb_{uuid.uuid4().hex[:8]}", api_key=k, provider=provider, account_id=acct)
        self._keys.append(record)
        return record

    def has_active_keys(self) -> bool:
        return any(k.is_available() for k in self._keys)

    def total_keys_count(self) -> int:
        return len(self._keys)

    def active_keys_count(self) -> int:
        return sum(1 for k in self._keys if k.is_available())

    async def get_next_key(self) -> Optional[KeyRecord]:
        """Thread-safe round-robin selection among active/available keys."""
        async with self._lock:
            available = [k for k in self._keys if k.is_available()]
            if not available:
                # Check if any cooling key is ready
                now = time.time()
                for k in self._keys:
                    if k.status == "cooling_down" and now >= k.cooldown_until:
                        k.status = "active"
                        available.append(k)

            if not available:
                return None

            self._rotation_idx = (self._rotation_idx + 1) % len(available)
            return available[self._rotation_idx]

    def map_model_name(self, target_model_name: str) -> str:
        """
        Maps AI VERSE public models to underlying Groq inference engine models.
        CYRUS -> qwen/qwen3.8-27b (Fast, versatile general intelligence)
        CYRAN -> openai/gpt-oss-20b (Deep multi-step reasoning)
        """
        m_lower = target_model_name.lower()
        if "cyran" in m_lower or "reason" in m_lower:
            return "openai/gpt-oss-20b"
        return "qwen/qwen3.8-27b"

    @staticmethod
    def _extract_cf_text(data: Dict[str, Any]) -> str:
        """Extracts text content from various Cloudflare Workers AI model response formats."""
        res = data.get("result", data)
        if isinstance(res, dict):
            choices = res.get("choices")
            if choices and isinstance(choices, list) and len(choices) > 0:
                msg = choices[0].get("message", {})
                if isinstance(msg, dict) and "content" in msg and msg["content"]:
                    return msg["content"]
            if "response" in res and isinstance(res["response"], str):
                return res["response"]
        return ""

    @staticmethod
    def _extract_cf_chunk_delta(chunk: Dict[str, Any]) -> str:
        """Extracts delta token from streaming Cloudflare Workers AI chunks."""
        choices = chunk.get("choices")
        if choices and isinstance(choices, list) and len(choices) > 0:
            delta = choices[0].get("delta", {})
            if isinstance(delta, dict) and "content" in delta and delta["content"]:
                return delta["content"]
        if "response" in chunk and isinstance(chunk["response"], str):
            return chunk["response"]
        return ""

    async def execute_completion(
        self,
        model_name: str,
        messages: List[Dict[str, Any]],
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
        top_p: float = 1.0,
        stream: bool = False
    ) -> Union[Dict[str, Any], AsyncGenerator[Dict[str, Any], None]]:
        """
        Executes a completion request across the key bank.
        On HTTP 429 or transient connection errors, immediately rotates to the next available key.
        Supports Groq, Cloudflare Workers AI, and NVIDIA NIM providers.
        """
        payload = {
            "model": self.map_model_name(model_name),
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
            "stream": stream
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens

        max_attempts = max(len(self._keys), 3)
        attempt = 0

        while attempt < max_attempts:
            attempt += 1
            key_record = await self.get_next_key()
            if not key_record:
                raise RuntimeError("All keys in the Key Bank are currently cooling down. Please try again shortly.")

            headers = {
                "Authorization": f"Bearer {key_record.api_key}",
                "Content-Type": "application/json"
            }

            # Select Provider Endpoint & Target Model
            if key_record.provider == "nvidia":
                endpoint = "https://integrate.api.nvidia.com/v1/chat/completions"
                engine_model = "google/gemma-4-31b-it" if "cyrus" in model_name.lower() else "mistralai/mistral-large-4-1t-a52b"
                timeout_sec = 25.0
                req_payload = {**payload, "model": engine_model}
            elif key_record.provider == "cloudflare":
                cf_model = "@cf/meta/llama-3.1-70b-instruct" if ("cyran" in model_name.lower() or "reason" in model_name.lower()) else "@cf/meta/llama-3.1-8b-instruct"
                account_id = key_record.account_id or self.settings.CLOUDFLARE_ACCOUNT_ID or "43c23c8793161bb5497dcacaf1706358"
                endpoint = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{cf_model}"
                timeout_sec = 30.0
                req_payload = {
                    "messages": messages,
                    "stream": stream
                }
                if max_tokens:
                    req_payload["max_tokens"] = max_tokens
            else:
                endpoint = "https://api.groq.com/openai/v1/chat/completions"
                engine_model = self.map_model_name(model_name)
                timeout_sec = 45.0
                req_payload = {**payload, "model": engine_model}

            try:
                if not stream:
                    async with httpx.AsyncClient(timeout=timeout_sec) as client:
                        resp = await client.post(
                            endpoint,
                            headers=headers,
                            json=req_payload
                        )

                        if resp.status_code == 200:
                            key_record.mark_success()
                            data = resp.json()
                            if key_record.provider == "cloudflare":
                                text = self._extract_cf_text(data)
                                return {
                                    "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
                                    "object": "chat.completion",
                                    "created": int(time.time()),
                                    "model": model_name,
                                    "choices": [{
                                        "index": 0,
                                        "message": {
                                            "role": "assistant",
                                            "content": text
                                        },
                                        "finish_reason": "stop"
                                    }],
                                    "usage": data.get("result", {}).get("usage", {})
                                }
                            return data
                        elif resp.status_code == 429:
                            # Rate limit hit -> cool down and fail over
                            key_record.mark_cooling(cooldown_seconds=60, reason="HTTP 429 Rate Limit Exceeded")
                            logger.warning(f"Key {key_record.masked_key} ({key_record.provider}) hit 429. Failing over (attempt {attempt})...")
                            continue
                        elif resp.status_code in {401, 403}:
                            key_record.status = "disabled"
                            key_record.last_error = f"HTTP {resp.status_code} Auth Failed"
                            logger.error(f"Key {key_record.masked_key} ({key_record.provider}) auth failed. Disabled from bank.")
                            continue
                        else:
                            # Server error on engine side
                            err_text = resp.text
                            logger.warning(f"Key {key_record.masked_key} returned {resp.status_code}: {err_text}")
                            key_record.mark_cooling(cooldown_seconds=20, reason=f"HTTP {resp.status_code}")
                            continue

                else:
                    # Streaming path: verify stream connects before yielding
                    client = httpx.AsyncClient(timeout=timeout_sec)
                    req = client.build_request(
                        "POST",
                        endpoint,
                        headers=headers,
                        json=req_payload
                    )
                    resp = await client.send(req, stream=True)

                    if resp.status_code == 200:
                        key_record.mark_success()

                        async def stream_generator() -> AsyncGenerator[Dict[str, Any], None]:
                            try:
                                async for line in resp.aiter_lines():
                                    line_clean = line.strip()
                                    if not line_clean:
                                        continue
                                    if line_clean.startswith("data: "):
                                        data_part = line_clean[6:]
                                        if data_part == "[DONE]":
                                            yield {"is_done": True, "chunk": None}
                                            break
                                        try:
                                            chunk_obj = json.loads(data_part)
                                            if key_record.provider == "cloudflare":
                                                delta_text = self._extract_cf_chunk_delta(chunk_obj)
                                                if delta_text:
                                                    standardized_chunk = {
                                                        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
                                                        "object": "chat.completion.chunk",
                                                        "created": int(time.time()),
                                                        "model": model_name,
                                                        "choices": [{
                                                            "index": 0,
                                                            "delta": {"content": delta_text},
                                                            "finish_reason": None
                                                        }]
                                                    }
                                                    yield {"is_done": False, "chunk": standardized_chunk}
                                            else:
                                                yield {"is_done": False, "chunk": chunk_obj}
                                        except Exception:
                                            pass
                            finally:
                                await resp.aclose()
                                await client.aclose()

                        return stream_generator()

                    elif resp.status_code == 429:
                        await resp.aclose()
                        await client.aclose()
                        key_record.mark_cooling(cooldown_seconds=60, reason="Streaming HTTP 429 Rate Limit")
                        continue
                    else:
                        await resp.aclose()
                        await client.aclose()
                        key_record.mark_cooling(cooldown_seconds=20, reason=f"Streaming HTTP {resp.status_code}")
                        continue

            except Exception as e:
                logger.warning(f"Exception using key {key_record.masked_key} ({key_record.provider}): {e}. Retrying with next key...")
                key_record.mark_cooling(cooldown_seconds=30, reason=str(e))
                continue

        raise RuntimeError("Key Bank was unable to fulfill the request after multiple failover attempts.")

    def get_bank_status(self) -> List[Dict[str, Any]]:
        """Returns the health status and usage metrics of all keys in the bank."""
        now = time.time()
        return [
            {
                "key_id": k.key_id,
                "masked_key": k.masked_key,
                "provider": k.provider,
                "status": "cooling_down" if (k.status == "cooling_down" and now < k.cooldown_until) else ("disabled" if k.status == "disabled" else "active"),
                "cooldown_remaining_sec": max(0, int(k.cooldown_until - now)) if k.status == "cooling_down" else 0,
                "success_count": k.success_count,
                "failure_count": k.failure_count,
                "last_error": k.last_error
            }
            for k in self._keys
        ]


key_bank_service = KeyBankService()
