# AI VERSE — Production Deployment Guide

## 1. Backend Deployment (Google Cloud Run / Railway / Render)

### Option A: Google Cloud Run (Recommended)
1. Ensure `gcloud` CLI is installed and authenticated.
2. Build and submit container image:
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-verse-backend
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy ai-verse-backend \
     --image gcr.io/YOUR_PROJECT_ID/ai-verse-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "APP_ENV=production,FIREBASE_PROJECT_ID=ai-verse-prod,CORS_ALLOWED_ORIGINS=https://aiverse.pages.dev"
   ```
4. Configure Secret Manager for `FIREBASE_SERVICE_ACCOUNT_JSON`, `WORKER_TOKEN_HASH_SECRET`, and `API_KEY_HASH_SECRET`.

## 2. Frontend Deployment (Cloudflare Pages / Vercel / Firebase Hosting)

### Cloudflare Pages
1. Build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
2. Environment variables:
   - `VITE_API_BASE_URL`: URL of your deployed Cloud Run backend
   - `VITE_FIREBASE_API_KEY`: Firebase web API key
   - `VITE_FIREBASE_PROJECT_ID`: `ai-verse-prod`
   - `VITE_FIREBASE_APP_ID`: Firebase Web App ID

## 3. Worker Deployment
1. Open `notebooks/cyrus_colab.ipynb` on Google Colab.
2. Configure Colab Secrets (`AI_VERSE_API_URL` and `CYRUS_WORKER_TOKEN`).
3. Open `notebooks/cyran_kaggle.ipynb` on Kaggle.
4. Configure Kaggle Secrets (`AI_VERSE_API_URL` and `CYRAN_WORKER_TOKEN`).
5. Run the notebook daemon loops.
