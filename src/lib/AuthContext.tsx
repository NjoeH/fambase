"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserFamilyId } from "./firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  familyId: string | null;
  familyLoading: boolean;
  googleAccessToken: string | null;
  signInWithGoogleToken: (accessToken: string) => Promise<void>;
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
    }, 8000);

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

  async function signInWithGoogleToken(accessToken: string) {
    const credential = GoogleAuthProvider.credential(null, accessToken);
    const result = await signInWithCredential(auth, credential);
    const cred = GoogleAuthProvider.credentialFromResult(result);
    if (cred?.accessToken) {
      setGoogleAccessToken(cred.accessToken);
      sessionStorage.setItem("google_access_token", cred.accessToken);
    }
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
    <AuthContext.Provider value={{ user, loading, familyId, familyLoading, googleAccessToken, signInWithGoogleToken, logout, refreshFamilyId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
