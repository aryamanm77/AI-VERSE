# AI VERSE — Troubleshooting & Operational Diagnostics

## 1. Worker Disconnections & Missing Heartbeats
**Symptom**: Worker row shows status `offline` in Admin Dashboard.
- **Cause**: Google Colab or Kaggle session disconnected or closed due to inactive browser tab.
- **Resolution**:
  1. Check the Colab/Kaggle notebook tab. Ensure the runtime is still allocated.
  2. Verify network connectivity to `AI_VERSE_API_URL`.
  3. Colab free tier sessions disconnect after ~90 minutes of inactivity; re-run the notebook cells.

## 2. Request Timeout (504 Gateway Timeout)
**Symptom**: `/v1/chat/completions` responds with `504 Gateway Timeout: Request timed out waiting for an active CYRUS worker`.
- **Cause**: No workers for that model family are currently polling `GET /api/workers/jobs/next`.
- **Resolution**:
  1. Check `/admin/workers` to verify at least one worker for `CYRUS` or `CYRAN` is `online`.
  2. Ensure the worker is polling and has sufficient VRAM to execute inference.

## 3. Subscription Upgrade Required (403 Forbidden)
**Symptom**: Calling `POST /v1/chat/completions` with `"model": "cyran"` returns `403 Forbidden: Model 'cyran' requires a PRO or ULTRA subscription`.
- **Resolution**:
  1. Log into the developer dashboard at `/dashboard/subscription`.
  2. Upgrade account to **PRO (₹149/mo)** or **ULTRA (₹299/mo)**.

## 4. Invalid API Key (401 Unauthorized)
**Symptom**: `401 Unauthorized: Invalid or revoked AI VERSE API key`.
- **Resolution**:
  1. Verify the key begins with `sk_verse_`.
  2. Confirm the key has not been revoked in `/dashboard/keys`.
  3. Ensure the `Authorization: Bearer sk_verse_...` header has no leading/trailing spaces.
