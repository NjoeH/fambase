"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // 若 Firebase 初始化失敗，5 秒後強制停止 loading 避免無限轉圈
    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(timeout);
      setUser(u);
      setLoading(false);
    });
    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    // 取得 Google OAuth token（用於呼叫 Drive API）
    const { GoogleAuthProvider } = await import("firebase/auth");
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setGoogleAccessToken(credential.accessToken);
      sessionStorage.setItem("google_access_token", credential.accessToken);
    }
  }

  async function logout() {
    await signOut(auth);
    setGoogleAccessToken(null);
    sessionStorage.removeItem("google_access_token");
  }

  return (
    <AuthContext.Provider value={{ user, loading, googleAccessToken, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
