# Firebase Project Setup & Security Configuration

AI VERSE uses Firebase as its primary identity provider and database engine.

## 1. Create Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `ai-verse-prod` (or your chosen identifier).
3. Disable Google Analytics if not needed, then create the project.

## 2. Enable Firebase Authentication

1. In the left navigation, go to **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable **Email/Password**.
4. (Optional) Configure OAuth providers (Google, GitHub) if desired.

## 3. Create Cloud Firestore Database

1. Under **Build**, select **Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore location close to your compute instances (e.g., `asia-south1` or `us-central1`).
4. Select **Start in production mode**.

## 4. Deploy Security Rules & Indexes

From the `firebase/` directory in this repository:

```bash
# Install Firebase CLI if not already present
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize or link project
firebase use --add ai-verse-prod

# Deploy firestore rules and compound indexes
firebase deploy --only firestore
```

The production rules in `firestore.rules` guarantee:
- Users cannot read or modify other users' documents.
- API keys, workers, and request queue modifications are strictly backend-only.
- Non-admin users cannot elevate their role to `admin`.

## 5. Generate Firebase Service Account Key

1. Go to **Project Settings** (gear icon) -> **Service accounts**.
2. Click **Generate new private key**.
3. Save the downloaded JSON file as `serviceAccountKey.json` inside `backend/` (never commit this file to Git).
4. In your `.env` file, specify:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json
   ```
