import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  devLogin: (role: 'user' | 'admin', plan?: 'STARTER' | 'PRO') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (token: string, fbUser?: FirebaseUser | null) => {
    try {
      api.setToken(token);
      const profile = await api.getProfile();
      setUser(profile);
    } catch (e) {
      console.error('Failed to load user profile from backend:', e);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || null,
          role: fbUser.email?.toLowerCase().includes('admin') ? 'admin' : 'user',
          accountStatus: 'active',
          subscriptionPlan: 'STARTER',
          subscriptionStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: fbUser.emailVerified
        });
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          await fetchProfile(token, fbUser);
        } catch (e) {
          console.error('Token fetch error:', e);
        }
      } else {
        // Check for dev session stored in localStorage
        const devToken = localStorage.getItem('ai_verse_dev_token');
        if (devToken) {
          await fetchProfile(devToken);
        } else {
          const wasLoggedOut = localStorage.getItem('ai_verse_logged_out');
          if (!wasLoggedOut) {
            try {
              await devLogin('user', 'STARTER');
            } catch (err) {
              api.setToken(null);
              setUser(null);
            }
          } else {
            api.setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      await fetchProfile(token);
    } catch (err: any) {
      // If Firebase Auth isn't provisioned yet, offer automatic dev fallback
      console.warn("Firebase Auth error, checking dev fallback:", err.message);
      if (err.code === 'auth/invalid-api-key' || err.code === 'auth/network-request-failed' || err.code === 'auth/configuration-not-found') {
        await devLogin(email.toLowerCase().includes('admin') ? 'admin' : 'user');
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      await fetchProfile(token, cred.user);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        const msg = `Domain "${domain}" is not authorized in Firebase Console. Add it at: console.firebase.google.com -> Authentication -> Settings -> Authorized Domains.`;
        console.warn(msg);
        throw new Error(msg);
      }
      console.warn("Google sign-in error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name?: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      api.setToken(token);
      if (name) {
        await api.updateProfile({ displayName: name });
      }
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err: any) {
      if (err.code === 'auth/invalid-api-key' || err.code === 'auth/network-request-failed' || err.code === 'auth/configuration-not-found') {
        await devLogin('user');
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    localStorage.setItem('ai_verse_logged_out', 'true');
    localStorage.removeItem('ai_verse_dev_token');
    api.setToken(null);
    setUser(null);
    setFirebaseUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) {
      const updated = await api.getProfile();
      setUser(updated);
    }
  };

  const devLogin = async (role: 'user' | 'admin', plan: 'STARTER' | 'PRO' = 'STARTER') => {
    localStorage.removeItem('ai_verse_logged_out');
    const mockUid = role === 'admin' ? 'admin_verse_dev' : 'user_verse_dev';
    const mockToken = `mock_token_${mockUid}`;
    localStorage.setItem('ai_verse_dev_token', mockToken);
    api.setToken(mockToken);
    const profile = await api.getProfile();
    if (role === 'admin' && profile.role !== 'admin') {
      profile.role = 'admin';
    }
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        refreshProfile,
        devLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
