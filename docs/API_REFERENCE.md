# AI VERSE — REST API Reference (OpenAI SDK Compatible)

## Base URL
- Production: `https://api.aiverse.com`
- Local: `http://localhost:8000`

## Authentication
Pass your AI VERSE API key in the `Authorization` header:
```http
Authorization: Bearer sk_verse_YOUR_KEY
```
or via the `X-API-Key` header:
```http
X-API-Key: sk_verse_YOUR_KEY
```

---

## 1. Chat Completions
### `POST /v1/chat/completions`

Dispatches a prompt to the AI VERSE model queue. The gateway waits for worker execution and returns the real model output.

#### Request Body
```json
{
  "model": "cyrus",
  "messages": [
    {
      "role": "system",
      "content": "You are a concise engineering assistant."
    },
    {
      "role": "user",
      "content": "What is the difference between synchronous and asynchronous queues?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false
}
```

#### Response Body
```json
{
  "id": "job_3f4a9b2c8e1d44aa",
  "object": "chat.completion",
  "created": 1731859200,
  "model": "cyrus",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "In a synchronous queue, producers and consumers block until items are transferred..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 118,
    "total_tokens": 142
  }
}
```

---

## 2. Models
### `GET /v1/models`
Returns list of active public models.

```json
{
  "object": "list",
  "data": [
    {
      "id": "cyrus",
      "object": "model",
      "created": 1710000000,
      "owned_by": "ai-verse",
      "display_name": "CYRUS",
      "description": "General-purpose intelligence",
      "category": "General Intelligence",
      "enabled": true,
      "context_window": 8192,
      "allowed_tiers": ["STARTER", "BASIC", "PRO", "ULTRA"]
    },
    {
      "id": "cyran",
      "object": "model",
      "created": 1710000000,
      "owned_by": "ai-verse",
      "display_name": "CYRAN",
      "description": "Advanced reasoning intelligence",
      "category": "Advanced Reasoning",
      "enabled": true,
      "context_window": 16384,
      "allowed_tiers": ["PRO", "ULTRA"]
    }
  ]
}
```

---

## 3. Subscriptions
### `GET /api/subscriptions/plans`
Returns the 4 pricing tiers in INR.

### `POST /api/subscriptions/upgrade`
Upgrades user subscription plan.
```json
{
  "planId": "PRO"
}
```

---

## 4. API Keys
### `POST /api/keys`
Creates an API key and returns the full plaintext string once.
```json
{
  "name": "Production Backend"
}
```

### `GET /api/keys`
Lists key prefixes and usage dates.

### `DELETE /api/keys/{key_id}`
Revokes an API key.
