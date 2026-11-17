# AI VERSE — Administrator Operations Guide

The Admin Portal (`/admin`) is restricted to accounts with `role: "admin"` in Firestore. The backend validates this authorization on every administrative endpoint.

## 1. Initial Admin Account Creation
To elevate an initial account to `admin`:
1. Register an account through `/register`.
2. In the Firebase Console -> **Firestore Database** -> `users` collection:
   - Find your user document (UID).
   - Edit the `role` field from `"user"` to `"admin"`.
3. In local development, logging in with an email starting with `admin@` automatically initializes the account with the `admin` role.

## 2. Worker Fleet Management
From `/admin/workers`:
1. Click **Add New Worker**.
2. Supply:
   - `Worker ID`: e.g. `cyrus-colab-1`
   - `Model`: `CYRUS` or `CYRAN`
   - `Provider`: `Google Colab` or `Kaggle`
3. Securely copy the generated token (`wtk_verse_...`). Add this token to the notebook environment secrets.
4. **Disabling/Enabling Workers**: Use the toggle button on any worker row to immediately revoke or grant queue claiming access without deleting historical metrics.

## 3. Queue Inspection & Maintenance
From `/admin/queue`:
- Inspect pending (`queued`) and in-flight (`assigned`) jobs.
- If a worker has locked a job but crashed, the automated lease expiration manager will return the job to the queue within 60 seconds.
- Admins can cancel stuck or malformed jobs by clicking **Cancel**.

## 4. User Moderation
From `/admin/users`:
- Search users by email, name, or UID.
- Inspect current subscription tier and verified email status.
- Suspend abusive accounts via the **Suspend** action. Requests from suspended accounts are blocked with `403 Forbidden`.
