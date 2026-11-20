import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.firebase_service import firebase_service
from app.services.api_key_service import api_key_service
from app.config import get_settings
from app.services.key_bank_service import key_bank_service, KeyRecord

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_bank_keys():
    """Ensures test keys are present in KeyBank for gateway tests."""
    env_keys = get_settings().KEY_BANK_GROQ_KEYS
    if env_keys:
        for i, k in enumerate(env_keys.split(",")):
            key_bank_service._keys.append(KeyRecord(f"kb_{i}", k, "groq"))
    else:
        for i in range(11):
            key_bank_service._keys.append(KeyRecord(f"kb_{i}", f"mock_key_{i}", "groq"))
    yield
    key_bank_service._keys.clear()


@pytest.fixture
def auth_header():
    user = {
        "uid": "test_key_bank_user",
        "email": "keybank@example.com",
        "displayName": "Key Bank Tester",
        "role": "user",
        "accountStatus": "active",
        "subscriptionPlan": "ULTRA",
        "subscriptionStatus": "active"
    }
    firebase_service.set_document("users", "test_key_bank_user", user)

    key_doc, raw_key = api_key_service.create_api_key(
        user_id="test_key_bank_user",
        name="Key Bank Test Key",
        format_mode="markdown",
        allow_overrides=False
    )
    return {"Authorization": f"Bearer {raw_key}"}


def test_system_status_shows_key_bank():
    res = client.get("/api/system/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["models"]["cyrus"]["available"] is True
    assert data["models"]["cyrus"]["online_workers"] >= 1
    assert "key_bank" in data
    assert data["key_bank"]["enabled"] is True
    assert data["key_bank"]["total_keys"] >= 11


def test_gateway_live_chat_completion(auth_header):
    payload = {
        "model": "cyrus",
        "messages": [
            {"role": "user", "content": "What is 2 + 2? Answer with just the number."}
        ],
        "max_tokens": 10
    }
    res = client.post("/v1/chat/completions", json=payload, headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert data["object"] == "chat.completion"
    assert data["model"] == "cyrus"
    assert len(data["choices"]) > 0
    content = data["choices"][0]["message"]["content"]
    assert "4" in content


def test_gateway_streaming_completion(auth_header):
    payload = {
        "model": "cyrus",
        "messages": [
            {"role": "user", "content": "Hello!"}
        ],
        "stream": True,
        "max_tokens": 15
    }
    res = client.post("/v1/chat/completions", json=payload, headers=auth_header)
    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]
    text = res.text
    assert "data: " in text
    assert "[DONE]" in text
