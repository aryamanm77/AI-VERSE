import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAr6iouvh13d1oIVYg6Jo6UnX7lw_ZKXsg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-verse-7ac4e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-verse-7ac4e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-verse-7ac4e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1032591865278",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1032591865278:web:374856f13b9193ef0db5ef"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
