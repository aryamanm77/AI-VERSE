# AI VERSE Universal AI API Gateway

The AI VERSE Universal AI API Gateway provides **100% OpenAI-compatible API drop-in compatibility** for any application, chat UI, coding tool (Cursor, Continue, Claude Dev, Copilot alternatives), bot, IDE extension, or script.

Every API response is **enforced on the SERVER** to arrive as clean, consistently structured GitHub-Flavored Markdown (GFM), regardless of which client or system prompt is sent.

---

## 1. Universal API Compatibility

- **Standard OpenAI Endpoints**:
  - `POST /v1/chat/completions` (SSE Streaming & Non-streaming)
  - `GET /v1/models` (CYRUS & CYRAN model list)
  - `POST /v1/completions` (Legacy text completion adapter)
  - `POST /v1/embeddings` (1536-dimensional embeddings for IDE indexing & tools)
- **Flexible Authentication**:
  - `Authorization: Bearer <sk_verse_...>`
  - `x-api-key: <sk_verse_...>`
  - `api-key: <sk_verse_...>`
  - `x-auth-token: <sk_verse_...>`
- **Client Resilience**:
  - `ConfigDict(extra="ignore")`: Accepts unknown parameters (e.g. `stream_options`, `tools`, `functions`, `user`, `seed`) without returning validation errors.
  - Full CORS support (`Access-Control-Allow-Origin: *`) for browser-based web apps.
  - Return model text unchanged in `choices[0].message.content` (or `delta.content` when streaming) without converting to HTML or escaping Markdown symbols.
  - Tool and function calling pass-through.

---

## 2. Server-Side Format Prompt & Editing

Formatting is strictly enforced on the server before client execution.

### How to Edit `FORMAT_PROMPT`:
Open `backend/app/format_prompt.py`:

```python
FORMAT_PROMPT = """Format every response in GitHub-flavored Markdown:
- Put all code in fenced blocks with a language tag (```python, ```kotlin, ```bash, ```json). Use `inline code` for commands, file names, and identifiers.
- Use tables (pipe syntax) for comparisons and structured data.
- Use headings (##, ###) only for long, multi-section answers.
- Use bullet or numbered lists for steps and options. Keep simple answers as plain prose.
- Use **bold** for key terms and > blockquotes for notes or warnings.
- Lead with the answer. Do not over-format short replies.
- Never wrap the whole response in a single code block."""

PLAIN_PROMPT = """Respond in plain text only. Do not use any Markdown formatting, symbols, asterisks, hashtags, backticks, pipe tables, or code fences."""
```

### Prompt Order Guarantee:
1. `FORMAT_PROMPT` is always inserted as the **FIRST system message** (Index 0).
2. Any client-sent system messages are placed **after** `FORMAT_PROMPT`.
3. Clients cannot remove, strip, or override `FORMAT_PROMPT`.

---

## 3. Per-Key Format Modes

When generating an API key in the AI VERSE UI or via `POST /api/keys`, select one of 3 format modes:

| Format Mode | Behavior | Use Case |
|---|---|---|
| `markdown` *(Default)* | Server injects `FORMAT_PROMPT` | Chat UIs, coding tools, IDE extensions, Markdown renderers |
| `plain` | Server injects `PLAIN_PROMPT` | Terminals, SMS, legacy apps that cannot render Markdown |
| `raw` | Skips format prompt completely | Automation workflows, strict JSON outputs, custom prompts |

---

## 4. Consistency Across Apps & Parameter Overrides

- **Pinned Model**: Default fallback to `cyrus` (developed by AM_77).
- **Default Temperature**: Pinned to low temperature (`0.3`) and `top_p: 1.0` for all keys.
- **Client Overrides**: Client-sent `temperature` and `top_p` are overridden to `0.3` unless the key has `allow_overrides: true`.

---

## 5. Streaming Safety

- Server-Sent Events (`stream=true`) emit chunks using a code-fence safe tokenizer:
  - Fenced code block headers (` ```python `) and closing fences (` ``` `) are preserved as atomic tokens and **never split across chunks**.
  - The concatenated streamed text is **byte-for-byte identical** to the non-streaming output.
  - Concludes with `finish_reason: "stop"` chunk and `"data: [DONE]"`.

---

## 6. Example Requests

### A. Non-Streaming Chat Completion (Bearer Auth)
```bash
curl -X POST https://ai-verse-backend-impj.onrender.com/v1/chat/completions \
  -H "Authorization: Bearer sk_verse_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cyrus",
    "messages": [
      {"role": "user", "content": "Compare Python and Go in a table with a quick code snippet."}
    ]
  }'
```

### B. Streaming Chat Completion (SSE, x-api-key Auth)
```bash
curl -N -X POST https://ai-verse-backend-impj.onrender.com/v1/chat/completions \
  -H "x-api-key: sk_verse_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cyrus",
    "messages": [
      {"role": "user", "content": "Write a Python script that calculates Fibonacci numbers."}
    ],
    "stream": true
  }'
```

### C. Plain Text Key Request (No Markdown)
```bash
curl -X POST https://ai-verse-backend-impj.onrender.com/v1/chat/completions \
  -H "Authorization: Bearer sk_verse_YOUR_PLAIN_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cyrus",
    "messages": [
      {"role": "user", "content": "List the top 3 principles of clean code."}
    ]
  }'
```

### D. OpenAI Python SDK Drop-in
```python
from openai import OpenAI

client = OpenAI(
    api_key="sk_verse_YOUR_KEY_HERE",
    base_url="https://ai-verse-backend-impj.onrender.com/v1"
)

# 1. Non-streaming
response = client.chat.completions.create(
    model="cyrus",
    messages=[{"role": "user", "content": "Explain binary search with a code block."}]
)
print(response.choices[0].message.content)

# 2. Live Streaming
stream = client.chat.completions.create(
    model="cyrus",
    messages=[{"role": "user", "content": "Tell me an inspiring quote."}],
    stream=True
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### E. OpenAI Node.js / JavaScript SDK Drop-in
```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk_verse_YOUR_KEY_HERE",
  baseURL: "https://ai-verse-backend-impj.onrender.com/v1"
});

const stream = await client.chat.completions.create({
  model: "cyrus",
  messages: [{ role: "user", content: "Create an HTTP server in Go." }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

---

## 7. Chat UI GitHub-Flavored Markdown Renderer

The AI VERSE web frontend playground (`frontend/src/App.tsx`) renders replies with `react-markdown` + `remark-gfm`:
- **Code Fences**: Styled with syntax badges, dark theme background, and single-click **Copy** button.
- **Tables**: GFM pipe tables with horizontal scrolling and styled borders.
- **Headings & Blockquotes**: Distinct callout borders and accents.
- **Sanitized HTML**: Safe against XSS vulnerabilities.

---

## 8. High-Availability Key Bank (Multi-Account Smart Load Balancer)

AI VERSE features an automated **Key Bank** that pools multiple free API keys across accounts (Groq, etc.) to deliver **100% 24/7 uptime with zero notebook dependency (no Colab, no Kaggle)**.

### Features
- **Round-Robin Load Distribution**: Evenly balances incoming traffic across all active keys in the bank.
- **Zero-Downtime Auto-Failover**: When any key hits a temporary rate limit (HTTP 429), it automatically enters a 60-second cooldown period, and the gateway seamlessly fails over to the next healthy key in `<50ms` with zero interruption to the user.
- **Seeded Capacity**: Pre-loaded with 11 accounts delivering **158,400+ requests/day** capacity.
- **Admin Management API**:
  - `GET /api/admin/key-bank`: View live key health, success counts, and cooldown timers.
  - `POST /api/admin/key-bank`: Add new keys dynamically at runtime.
- **Environment Configuration**: Set `KEY_BANK_GROQ_KEYS="gsk_key1,gsk_key2,..."` on Render to override or expand the pool.
