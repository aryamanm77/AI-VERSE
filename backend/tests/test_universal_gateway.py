import json
import time
import threading
import pytest
from fastapi.testclient import TestClient
from app.services.firebase_service import firebase_service
from app.services.api_key_service import api_key_service
from app.services.job_service import job_service
from app.format_prompt import FORMAT_PROMPT, PLAIN_PROMPT
from app.routes.chat import tokenize_stream_safely


def setup_test_user_and_keys():
    """Sets up user and API keys for markdown, plain, and raw modes."""
    user = {
        "uid": "gateway_user_1",
        "email": "gateway@example.com",
        "displayName": "Gateway Tester",
        "role": "user",
        "accountStatus": "active",
        "subscriptionPlan": "ULTRA",
        "subscriptionStatus": "active"
    }
    firebase_service.set_document("users", "gateway_user_1", user)

    # 1. Default Markdown Key (allow_overrides=False)
    _, md_key = api_key_service.create_api_key(
        user_id="gateway_user_1",
        name="Markdown Default Key",
        format_mode="markdown",
        allow_overrides=False
    )

    # 2. Plain Key
    _, plain_key = api_key_service.create_api_key(
        user_id="gateway_user_1",
        name="Plain Text Key",
        format_mode="plain",
        allow_overrides=False
    )

    # 3. Raw Key
    _, raw_key = api_key_service.create_api_key(
        user_id="gateway_user_1",
        name="Raw Passthrough Key",
        format_mode="raw",
        allow_overrides=False
    )

    # 4. Overrides-Allowed Key
    _, override_key = api_key_service.create_api_key(
        user_id="gateway_user_1",
        name="Overrides Allowed Key",
        format_mode="markdown",
        allow_overrides=True
    )

    return {
        "md_key": md_key,
        "plain_key": plain_key,
        "raw_key": raw_key,
        "override_key": override_key
    }


def complete_enqueued_job_async(result_text: str):
    """Spawns a background thread that immediately completes the next queued job."""
    def worker_loop():
        for _ in range(60):
            time.sleep(0.02)
            jobs = firebase_service.query_collection("request_jobs", filters=[("status", "==", "queued")])
            if jobs:
                target = jobs[0]
                firebase_service.update_document("request_jobs", target["jobId"], {
                    "status": "completed",
                    "result": {
                        "text": result_text,
                        "finish_reason": "stop",
                        "prompt_tokens": 12,
                        "completion_tokens": 28
                    },
                    "completedAt": "2026-11-19T17:30:00Z"
                })
                return
    t = threading.Thread(target=worker_loop)
    t.start()
    return t


def test_server_format_prompt_injection_and_retention(client: TestClient):
    """
    Test requirement 2 & 3:
    1. FORMAT_PROMPT must be the FIRST system message.
    2. Client-sent system messages must be preserved and placed AFTER FORMAT_PROMPT.
    3. Clients cannot remove or override FORMAT_PROMPT.
    4. Client with extra unknown parameters still succeeds (extra="ignore").
    """
    keys = setup_test_user_and_keys()
    sample_text = "Here is the response:\n```python\nprint(42)\n```\nDone."

    t = complete_enqueued_job_async(sample_text)
    resp = client.post(
        "/v1/chat/completions",
        headers={"Authorization": f"Bearer {keys['md_key']}"},
        json={
            "model": "cyrus",
            "messages": [
                {"role": "system", "content": "You are a specialized math tutor."},
                {"role": "user", "content": "Calculate 40 + 2"}
            ],
            # Extra unknown fields sent by clients like Cursor/LangChain
            "extra_custom_param": "some_value",
            "stream_options": {"include_usage": True}
        }
    )
    t.join()

    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "choices" in data
    assert data["choices"][0]["message"]["content"] == sample_text

    # Verify the payload received by the worker has FORMAT_PROMPT as message 0,
    # followed by the client's custom system message
    completed_jobs = firebase_service.query_collection("request_jobs")
    last_job = completed_jobs[-1]
    messages = last_job["requestPayload"]["messages"]

    assert messages[0]["role"] == "system"
    assert "Format every response in GitHub-flavored Markdown" in messages[0]["content"]
    assert messages[1]["role"] == "system"
    assert messages[1]["content"] == "You are a specialized math tutor."
    assert messages[2]["role"] == "user"
    assert messages[2]["content"] == "Calculate 40 + 2"


def test_per_key_format_modes(client: TestClient):
    """
    Test requirement 3:
    - 'plain' key injects PLAIN_PROMPT forbidding markdown.
    - 'raw' key skips format prompt completely.
    - Test x-api-key header authentication.
    """
    keys = setup_test_user_and_keys()

    # 1. Plain Key Request (using x-api-key header)
    t1 = complete_enqueued_job_async("Result is 42.")
    resp_plain = client.post(
        "/v1/chat/completions",
        headers={"x-api-key": keys["plain_key"]},
        json={
            "model": "cyrus",
            "messages": [{"role": "user", "content": "Tell me 42 in plain text"}]
        }
    )
    t1.join()
    assert resp_plain.status_code == 200

    plain_jobs = firebase_service.query_collection("request_jobs")
    plain_msgs = plain_jobs[-1]["requestPayload"]["messages"]
    assert "Respond in plain text only" in plain_msgs[0]["content"]
    assert "Format every response in GitHub-flavored Markdown" not in plain_msgs[0]["content"]

    # 2. Raw Key Request (using Bearer header)
    t2 = complete_enqueued_job_async('{"status": "ok", "value": 42}')
    resp_raw = client.post(
        "/v1/chat/completions",
        headers={"Authorization": f"Bearer {keys['raw_key']}"},
        json={
            "model": "cyrus",
            "messages": [{"role": "user", "content": "Return raw JSON"}]
        }
    )
    t2.join()
    assert resp_raw.status_code == 200

    raw_jobs = firebase_service.query_collection("request_jobs")
    raw_msgs = raw_jobs[-1]["requestPayload"]["messages"]
    # In raw mode, format prompt is completely skipped
    assert "Format every response in GitHub-flavored Markdown" not in raw_msgs[0]["content"]
    assert "Respond in plain text only" not in raw_msgs[0]["content"]


def test_temperature_overrides_policy(client: TestClient):
    """
    Test requirement 4:
    - Default key overrides client-sent temperature/top_p to 0.3/1.0
    - Key with allow_overrides=True respects client-sent temperature/top_p
    """
    keys = setup_test_user_and_keys()

    # Without overrides allowed: client sends 1.8 -> overridden to 0.3
    t1 = complete_enqueued_job_async("ok")
    resp1 = client.post(
        "/v1/chat/completions",
        headers={"Authorization": f"Bearer {keys['md_key']}"},
        json={
            "model": "cyrus",
            "messages": [{"role": "user", "content": "hi"}],
            "temperature": 1.8
        }
    )
    t1.join()
    assert resp1.status_code == 200
    j1 = firebase_service.query_collection("request_jobs")[-1]
    assert j1["requestPayload"]["temperature"] == 0.3
    assert j1["requestPayload"]["top_p"] == 1.0

    # With overrides allowed: client sends 0.85 -> preserved as 0.85
    t2 = complete_enqueued_job_async("ok")
    resp2 = client.post(
        "/v1/chat/completions",
        headers={"Authorization": f"Bearer {keys['override_key']}"},
        json={
            "model": "cyrus",
            "messages": [{"role": "user", "content": "hi"}],
            "temperature": 0.85
        }
    )
    t2.join()
    assert resp2.status_code == 200
    j2 = firebase_service.query_collection("request_jobs")[-1]
    assert j2["requestPayload"]["temperature"] == 0.85


def test_streaming_safety_and_consistency(client: TestClient):
    """
    Test requirement 5:
    - Streaming concatenated text matches non-streaming exactly
    - Code fences (```) are never broken across chunks
    - Proper finish_reason and [DONE] marker
    """
    keys = setup_test_user_and_keys()
    test_text = (
        "# Overview\n\n"
        "Here is the table:\n\n"
        "| Name | Version |\n"
        "|---|---|\n"
        "| CYRUS | 4.0 |\n\n"
        "Here is the implementation:\n\n"
        "```python\n"
        "def hello_world():\n"
        "    return 'Hello AI VERSE'\n"
        "```\n\n"
        "> Note: verified."
    )

    # 1. Test safe tokenizer integrity
    tokens = tokenize_stream_safely(test_text)
    reconstructed = "".join(tokens)
    assert reconstructed == test_text
    # Ensure code fence ```python is an atomic token
    assert any(t == "```python" for t in tokens)
    assert any(t == "```" for t in tokens)

    # 2. Test live SSE streaming endpoint
    t = complete_enqueued_job_async(test_text)
    resp = client.post(
        "/v1/chat/completions",
        headers={"Authorization": f"Bearer {keys['md_key']}"},
        json={
            "model": "cyrus",
            "messages": [{"role": "user", "content": "Generate table and code"}],
            "stream": True
        }
    )
    t.join()

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]

    lines = resp.text.split("\n")
    streamed_tokens = []
    has_done = False
    has_stop = False

    for line in lines:
        if line.startswith("data: "):
            payload = line[6:].strip()
            if payload == "[DONE]":
                has_done = True
                continue
            chunk = json.loads(payload)
            choice = chunk["choices"][0]
            if "content" in choice.get("delta", {}):
                streamed_tokens.append(choice["delta"]["content"])
            if choice.get("finish_reason") == "stop":
                has_stop = True

    assert has_done is True
    assert has_stop is True
    concatenated_stream = "".join(streamed_tokens)
    assert concatenated_stream == test_text


def test_openai_sdk_compatibility_endpoints(client: TestClient):
    """
    Test requirement 1:
    - GET /v1/models returns model list in OpenAI standard format
    - POST /v1/completions functions as text completion adapter
    - POST /v1/embeddings returns valid 1536-dim embedding vectors
    """
    keys = setup_test_user_and_keys()

    # 1. Models list
    m_resp = client.get("/v1/models")
    assert m_resp.status_code == 200
    m_data = m_resp.json()
    assert m_data["object"] == "list"
    assert any(m["id"] == "cyrus" for m in m_data["data"])

    # 2. Text completions
    t = complete_enqueued_job_async("Legacy completed text")
    c_resp = client.post(
        "/v1/completions",
        headers={"Authorization": f"Bearer {keys['md_key']}"},
        json={
            "model": "cyrus",
            "prompt": "Say this is a test"
        }
    )
    t.join()
    assert c_resp.status_code == 200
    c_data = c_resp.json()
    assert c_data["object"] == "text_completion"
    assert c_data["choices"][0]["text"] == "Legacy completed text"

    # 3. Embeddings
    e_resp = client.post(
        "/v1/embeddings",
        headers={"Authorization": f"Bearer {keys['md_key']}"},
        json={
            "model": "text-embedding-3-small",
            "input": "The quick brown fox jumps over the lazy dog"
        }
    )
    assert e_resp.status_code == 200
    e_data = e_resp.json()
    assert e_data["object"] == "list"
    assert len(e_data["data"]) == 1
    assert e_data["data"][0]["object"] == "embedding"
    assert len(e_data["data"][0]["embedding"]) == 1536
