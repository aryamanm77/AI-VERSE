# AI VERSE — Security Architecture & Guidelines

Security is designed as a core platform pillar across the authentication, API gateway, database, and notebook layers.

## 1. Authentication & Role-Based Access Control
- **Firebase ID Token Verification**: The FastAPI backend parses and verifies cryptographic signatures on incoming JWTs via the Firebase Admin SDK.
- **Account State Verification**: Suspended or disabled accounts are immediately rejected before executing database or compute actions.
- **Role Validation**: All `/api/admin/*` endpoints strictly demand `user.role === 'admin'`. Non-admin users are rejected with `403 Forbidden`.

## 2. API Key Protection
- **Cryptographic Generation**: Keys are generated using Python's `secrets` module (`sk_verse_` + 48 hex characters).
- **One-Time Reveal**: The complete key is returned to the user exactly once upon creation.
- **HMAC-SHA256 Hash Storage**: The backend stores only `keyHash` (HMAC-SHA256 with `API_KEY_HASH_SECRET`). Even if the database were compromised, raw API keys cannot be recovered.
- **Prefix Matching**: Keys are queried by prefix (`sk_verse_...`) and validated using constant-time comparison (`hmac.compare_digest`).

## 3. Worker Authentication
- Every worker instance (Colab or Kaggle) receives a distinct secret token (`wtk_verse_...`).
- Stored as HMAC-SHA256 hashes (`WORKER_TOKEN_HASH_SECRET`).
- Workers can only claim jobs for their assigned model family.

## 4. Firestore Security Rules
- Client apps (browsers) can only read and update permitted profile fields (`displayName`, `photoURL`).
- All privileged collections (`request_jobs`, `workers`, `worker_events`, `api_keys`) are write-protected against direct browser tampering.
- Only the FastAPI backend (via Firebase Admin SDK) performs queue assignment, lease operations, and worker state updates.
