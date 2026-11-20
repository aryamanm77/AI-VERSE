import pytest
import asyncio
from app.services.key_bank_service import KeyBankService, KeyRecord


@pytest.fixture
def bank_service():
    service = KeyBankService()
    # Inject test keys
    service._keys = [
        KeyRecord("test_k1", "gsk_test11111111111111111111111111111111", "groq"),
        KeyRecord("test_k2", "gsk_test22222222222222222222222222222222", "groq"),
        KeyRecord("test_k3", "gsk_test33333333333333333333333333333333", "groq")
    ]
    service._rotation_idx = 0
    return service


@pytest.mark.asyncio
async def test_key_bank_round_robin_rotation(bank_service):
    k1 = await bank_service.get_next_key()
    k2 = await bank_service.get_next_key()
    k3 = await bank_service.get_next_key()
    k4 = await bank_service.get_next_key()

    assert k1.key_id == "test_k2"
    assert k2.key_id == "test_k3"
    assert k3.key_id == "test_k1"
    assert k4.key_id == "test_k2"


@pytest.mark.asyncio
async def test_key_bank_rate_limit_cooldown(bank_service):
    k = bank_service._keys[0]
    assert k.is_available() is True

    # Mark cooling down
    k.mark_cooling(cooldown_seconds=60, reason="HTTP 429 Rate Limit")
    assert k.is_available() is False
    assert k.status == "cooling_down"

    # Should only return k2 and k3 now
    picked = await bank_service.get_next_key()
    assert picked.key_id in ["test_k2", "test_k3"]


@pytest.mark.asyncio
async def test_key_bank_has_active_keys(bank_service):
    assert bank_service.has_active_keys() is True
    assert bank_service.active_keys_count() == 3

    # Cool down all keys
    for k in bank_service._keys:
        k.mark_cooling(cooldown_seconds=100)

    assert bank_service.has_active_keys() is False
    assert bank_service.active_keys_count() == 0


@pytest.mark.asyncio
async def test_key_bank_live_inference():
    """Test live generation with the real seeded keys from env if configured."""
    from app.config import get_settings
    env_keys = get_settings().KEY_BANK_GROQ_KEYS
    if not env_keys:
        pytest.skip("No KEY_BANK_GROQ_KEYS in environment, skipping live call")

    service = KeyBankService()
    for i, dk in enumerate(env_keys.split(",")):
        service._keys.append(KeyRecord(f"kb_{i}", dk, "groq"))
    assert service.has_active_keys() is True

    messages = [
        {"role": "system", "content": "You are CYRUS, an AI assistant."},
        {"role": "user", "content": "Respond with the single word: VERIFIED"}
    ]

    result = await service.execute_completion(
        model_name="cyrus",
        messages=messages,
        temperature=0.1,
        max_tokens=20,
        stream=False
    )

    assert "choices" in result
    content = result["choices"][0]["message"]["content"]
    assert len(content) > 0


def test_key_bank_cloudflare_helpers():
    """Verify Cloudflare Workers AI response and chunk extractors."""
    # 1. Non-streaming OpenAI format in Cloudflare
    resp_openai = {
        "result": {
            "choices": [{"message": {"role": "assistant", "content": "Hello from 8B"}}]
        }
    }
    assert KeyBankService._extract_cf_text(resp_openai) == "Hello from 8B"

    # 2. Non-streaming raw response format in Cloudflare (70B)
    resp_raw = {
        "result": {
            "response": "Hello from 70B"
        }
    }
    assert KeyBankService._extract_cf_text(resp_raw) == "Hello from 70B"

    # 3. Streaming chunks
    chunk_openai = {"choices": [{"delta": {"content": "token1"}}]}
    chunk_raw = {"response": "token2"}
    assert KeyBankService._extract_cf_chunk_delta(chunk_openai) == "token1"
    assert KeyBankService._extract_cf_chunk_delta(chunk_raw) == "token2"


def test_key_bank_auto_detect_provider():
    """Verify provider detection based on key format."""
    service = KeyBankService()
    k_groq = service.add_key("gsk_1234567890abcdef")
    k_nv = service.add_key("nvapi-1234567890abcdef")
    k_cf = service.add_key("cfut_1234567890abcdef")

    assert k_groq.provider == "groq"
    assert k_nv.provider == "nvidia"
    assert k_cf.provider == "cloudflare"

