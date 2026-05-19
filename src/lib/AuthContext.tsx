"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { getUserFamilyId } from "./firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  familyId: string | null;
  familyLoading: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshFamilyId: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setFamilyLoading(false);
    }, 5000);

    getRedirectResult(auth).then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setGoogleAccessToken(credential.accessToken);
          sessionStorage.setItem("google_access_token", credential.accessToken);
        }
      }
    }).catch(console.error);

    const unsub = onAuthStateChanged(auth, async (u) => {
      clearTimeout(timeout);
      setUser(u);
      setLoading(false);

      if (u) {
        setFamilyLoading(true);
        try {
          const id = await getUserFamilyId(u.uid);
          setFamilyId(id);
        } finally {
          setFamilyLoading(false);
        }
      } else {
        setFamilyId(null);
        setFamilyLoading(false);
      }
    });

    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  async function signInWithGoogle() {
    await signInWithRedirect(auth, googleProvider);
  }

  async function logout() {
    await signOut(auth);
    setFamilyId(null);
    setGoogleAccessToken(null);
    sessionStorage.removeItem("google_access_token");
  }

  async function refreshFamilyId() {
    if (!user) return;
    const id = await getUserFamilyId(user.uid);
    setFamilyId(id);
  }

  return (
    <AuthContext.Provider value={{ user, loading, familyId, familyLoading, googleAccessToken, signInWithGoogle, logout, refreshFamilyId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
