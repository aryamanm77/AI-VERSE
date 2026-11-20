# Key Bank & Smart Load Balancer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the AI VERSE backend into a high-availability Key Bank that pools multiple free API keys across accounts (Groq, Gemini, etc.), balances load with round-robin rotation, and automatically fails over on rate limits (HTTP 429) so users and developers never experience timeouts or quota exhaustion.

**Architecture:** A thread-safe, resilient `KeyBankService` manages an in-memory & Firestore key registry. It dynamically pulls keys from environment variables (`KEY_BANK_GROQ_KEYS`, `GROQ_API_KEY`, `KEY_BANK_GEMINI_KEYS`) and Firestore `key_bank`. The Universal Gateway (`chat.py`) routes through `KeyBankService`, enforcing server-side `FORMAT_PROMPT` and AM_77 brand identity (`CYRUS`/`CYRAN`), and auto-cooling keys that hit 429 rate limits while immediately switching to the next healthy key.

**Tech Stack:** Python 3.10+, FastAPI, httpx (async HTTP & SSE streaming), Firestore (Firebase Admin SDK), Pydantic v2, pytest.

**Spec:** Multi-key bank storage, round-robin load distribution, automatic rate-limit cooldown with zero-downtime failover, admin management endpoints, and system status integration.

## Global Constraints

- **Universal OpenAI Compatibility:** `POST /v1/chat/completions` must continue honoring OpenAI spec and accept `Authorization: Bearer sk-verse-...`.
- **Identity & Formatting Preservation:** Server-side `FORMAT_PROMPT` and `CYRUS`/`CYRAN` AM_77 brand persona must always be injected and enforced on all responses.
- **Zero Downtime Failover:** On HTTP 429 or transient error, the gateway must switch to the next active key in <50ms without failing the user's request.
- **Backward Compatibility:** All existing 16 unit and integration tests must continue to pass.

## Review Focus

1. **429 Rate Limit Failover:** When Key 1 returns HTTP 429, it must immediately cool down and Key 2 must fulfill the request without error.
2. **Streaming Safety:** When `stream=True`, SSE chunks must stream seamlessly to the client, even across format sanitizer tokens.
3. **Empty Bank Graceful Fallback:** If no keys are registered in the bank, the gateway returns a clear 503 Service Unavailable ("Key bank empty, please add backend keys").
4. **Dynamic Key Ingestion:** Keys added via environment variables or Firestore collection `key_bank` are recognized immediately without server restarts.
5. **Brand Sanitization:** Responses generated through underlying models (e.g. `gemma2-9b-it`) must have model names sanitized to `CYRUS` / `AM_77`.

---

### Task 1: Core KeyBank Data Structures & Service (`app/services/key_bank_service.py`)

**Files:**
- Create: `backend/app/services/key_bank_service.py`
- Modify: `backend/app/config.py`
- Test: `backend/tests/test_key_bank_service.py`

- [ ] **Step 1:** Add settings fields `KEY_BANK_GROQ_KEYS: str = ""` and `KEY_BANK_GEMINI_KEYS: str = ""` to `backend/app/config.py`.
- [ ] **Step 2:** Write unit tests in `backend/tests/test_key_bank_service.py` verifying:
  - Key registration and initialization from comma-separated string.
  - Round-robin selection among active keys.
  - Cooldown transition on 429 error and automatic reactivation after cooldown expiry.
  - Failover when the first key fails.
- [ ] **Step 3:** Implement `KeyBankService` in `backend/app/services/key_bank_service.py` with thread-safe rotation, health tracking, cooldown timers, and provider routing (Groq and Gemini OpenAI-compatible endpoints).
- [ ] **Step 4:** Run `pytest backend/tests/test_key_bank_service.py` and confirm all tests pass.
- [ ] **Step 5:** Commit changes with message `feat(key-bank): implement core KeyBankService with load balancing and auto-failover`.

---

### Task 2: Gateway Integration & Direct Inference Execution (`app/routes/chat.py`)

**Files:**
- Modify: `backend/app/routes/chat.py`
- Modify: `backend/app/routes/health.py`
- Test: `backend/tests/test_gateway_key_bank.py`

- [ ] **Step 1:** Write integration test in `backend/tests/test_gateway_key_bank.py` simulating chat completions through `KeyBankService`:
  - Standard JSON response with format enforcement.
  - Streaming SSE response with code-fence safety.
  - Simulation of 429 failover to second key.
- [ ] **Step 2:** Update `backend/app/routes/chat.py` to route through `key_bank_service`:
  - If Key Bank has active keys, execute directly via Key Bank with instant sub-second response.
  - Fallback to queued worker jobs if Key Bank has no keys configured.
- [ ] **Step 3:** Update `backend/app/routes/health.py` (`/api/system/status`) so `models.cyrus.available` and `models.cyran.available` report `True` whenever Key Bank has active keys.
- [ ] **Step 4:** Run `pytest backend/tests/test_gateway_key_bank.py` and all previous tests (`pytest backend/tests/`).
- [ ] **Step 5:** Commit changes with message `feat(chat): route completions through KeyBankService with instant response and auto-failover`.

---

### Task 3: Admin Key Management Endpoints (`app/routes/admin.py`)

**Files:**
- Modify: `backend/app/routes/admin.py`
- Test: `backend/tests/test_admin_key_bank.py`

- [ ] **Step 1:** Write tests for Key Bank admin endpoints (`GET /api/admin/key-bank`, `POST /api/admin/key-bank`, `DELETE /api/admin/key-bank/{key_id}`).
- [ ] **Step 2:** Implement admin endpoints to view key health (active, cooling, request count, latency) and add/remove keys dynamically to Firestore.
- [ ] **Step 3:** Run `pytest backend/tests/test_admin_key_bank.py` and confirm tests pass.
- [ ] **Step 4:** Commit changes with message `feat(admin): add dynamic key bank management endpoints`.

---

### Task 4: Full Suite Verification & Deployment

**Files:**
- Update: `README_GATEWAY.md`
- Verify: Full pytest suite

- [ ] **Step 1:** Run full test suite: `pytest backend/tests/` to guarantee zero regressions across all 16+ tests.
- [ ] **Step 2:** Update `README_GATEWAY.md` with instructions on configuring `KEY_BANK_GROQ_KEYS` in Render.
- [ ] **Step 3:** Push to GitHub `main` branch to trigger auto-deployment to Render.
