# AI VERSE — Frontend Setup & Configuration

## 1. Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm or pnpm

## 2. Installation

```bash
cd frontend
npm install
```

## 3. Environment Variables

Create `.env` inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ai-verse-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-verse-prod
VITE_FIREBASE_STORAGE_BUCKET=ai-verse-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```

## 4. Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 5. Production Build

```bash
npm run build
```

Build outputs are compiled into `frontend/dist/`, suitable for deployment to Cloudflare Pages, Vercel, or Firebase Hosting.
