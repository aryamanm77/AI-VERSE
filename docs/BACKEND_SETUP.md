# AI VERSE — FastAPI Backend Setup Guide

## 1. Prerequisites

- Python 3.10+ (Recommended Python 3.11 or 3.12)
- Pip and virtualenv
- Firebase service account JSON key (or local emulator)

## 2. Local Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following parameters:

```env
APP_ENV=development
APP_NAME=AI VERSE
PORT=8000
HOST=0.0.0.0

# Firebase
FIREBASE_PROJECT_ID=ai-verse-prod
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json

# Secrets (use strong random 32+ character strings)
WORKER_TOKEN_HASH_SECRET=your_32_character_worker_token_secret_here
API_KEY_HASH_SECRET=your_32_character_api_key_secret_here

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Timeouts
REQUEST_TIMEOUT_SECONDS=120
WORKER_HEARTBEAT_TIMEOUT_SECONDS=45
JOB_LEASE_SECONDS=60
MAX_JOB_RETRIES=2
```

## 4. Launching the Backend

```bash
# Start with Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 5. Running the Automated Test Suite

```bash
pytest -v
```
