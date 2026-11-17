# AI VERSE — Multi-Model AI API Platform

**"One Universe. Infinite Intelligence."**

AI VERSE is a full-stack, production-grade AI API platform with user authentication, subscription plans, API key management, model routing, worker orchestration, Firebase Cloud Firestore integration, an admin dashboard, documentation, and Google Colab & Kaggle worker connections.

---

## 🌟 Key Highlights

- **Multi-Model Routing**: Offers **CYRUS** (General Intelligence) and **CYRAN** (Advanced Reasoning) with decoupled public model endpoints.
- **Worker-Pull Queuing Architecture**: Real model inference executed on Google Colab (`cyrus-colab-1`) and Kaggle (`cyran-kaggle-1`) GPU workers.
- **OpenAI SDK Compatible**: Standard `POST /v1/chat/completions` and `GET /v1/models` endpoints.
- **Cryptographic Security**: API keys (`sk_verse_...`) and Worker Tokens (`wtk_verse_...`) stored as HMAC-SHA256 hashes with constant-time verification.
- **Fair Scheduling**: Priority-based job dispatch (Starter ₹0, Basic ₹49, Pro ₹149, Ultra ₹299 in INR) with zero fake quotas.
- **Production Admin Portal**: Worker fleet status, real-time GPU telemetry, request queue inspection, audit logs, and user moderation.

---

## 🏗️ Repository Layout

```
ai-verse/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── routes/           # Auth, Users, Subscriptions, Keys, Models, Chat, Workers, Admin, Usage, Health
│   │   ├── services/         # Firebase, Auth, API Keys, Subscriptions, Models, Workers, Jobs, Usage
│   │   ├── scheduler/        # Model Router, Queue Manager, Lease Tracker
│   │   ├── security/         # Firebase Auth, Worker Auth, API Key Auth, Permissions
│   │   └── schemas/          # Pydantic validation schemas
│   ├── tests/                # Automated pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, AdminSidebar, ProtectedRoute
│   │   ├── pages/public/     # Home, Models, Pricing, Docs, Login, Register, ForgotPassword
│   │   ├── pages/dashboard/  # Overview, Playground, API Keys, Models, Usage, History, Subscription, Settings
│   │   ├── pages/admin/      # Overview, Workers Fleet, Queue, Logs, Users Directory
│   │   └── context/          # Firebase Authentication Context
│   └── package.json
├── notebooks/                # Production Model Workers
│   ├── cyrus_colab.ipynb     # Google Colab CYRUS Worker
│   ├── cyran_kaggle.ipynb    # Kaggle CYRAN Worker
│   └── mock_worker.py        # Local Dev Mock Worker
├── firebase/                 # Firebase Rules & Emulator Config
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── firebase.json
└── docs/                     # Comprehensive Architecture & Operations Documentation
```

---

## 🚀 Quickstart Guide

### 1. Run the FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
API Documentation: `http://localhost:8000/docs`

### 2. Run the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Web Application: `http://localhost:5173`

### 3. Run a Local Dev Worker
In a new terminal:
```bash
cd notebooks
# Admin provisions a worker in the Admin Portal, then run:
python mock_worker.py --worker-id cyrus-colab-1 --model CYRUS --token <YOUR_WORKER_TOKEN>
```

---

## 📚 Complete Technical Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Firebase Setup & Rules](docs/FIREBASE_SETUP.md)
- [Backend Setup Guide](docs/BACKEND_SETUP.md)
- [Frontend Setup Guide](docs/FRONTEND_SETUP.md)
- [Google Colab CYRUS Worker](docs/CYRUS_COLAB_SETUP.md)
- [Kaggle CYRAN Worker](docs/CYRAN_KAGGLE_SETUP.md)
- [Worker Daemon Protocol](docs/WORKER_PROTOCOL.md)
- [REST API Reference](docs/API_REFERENCE.md)
- [Admin Operations Guide](docs/ADMIN_GUIDE.md)
- [Security Architecture](docs/SECURITY.md)
- [Production Deployment](docs/DEPLOYMENT.md)
- [Troubleshooting & Diagnostics](docs/TROUBLESHOOTING.md)
