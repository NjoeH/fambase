"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import Icon from "@/components/Icon";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!loading && user) {
      // 已登入 → 先去檢查有沒有家庭（之後接 Firestore），暫時導首頁
      router.replace(`/${locale}`);
    }
  }, [user, loading, router, locale]);

  async function handleLogin() {
    try {
      await signInWithGoogle();
      // onAuthStateChanged 會觸發上面的 useEffect
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9faf7] flex flex-col items-center justify-center px-6">

      {/* Logo & Brand */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-[#a7d7c5] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <Icon name="home_heart" className="text-[#3a6758] text-5xl" />
        </div>
        <h1 className="text-4xl font-bold text-[#3a6758]">FamBase</h1>
        <p className="text-base text-[#404945] mt-1">家庭生活，一站管理</p>
      </div>

      {/* Feature hints */}
      <div className="w-full max-w-sm space-y-2 mb-8">
        {[
          { icon: "receipt_long",         text: "帳單、保固、車輛集中管理" },
          { icon: "folder",               text: "重要文件安全存放在 Google Drive" },
          { icon: "notifications_active", text: "到期前自動提醒，不漏接" },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-4 bg-[#f3f4f1] rounded-xl px-4 py-3">
            <Icon name={f.icon} className="text-[#3a6758] shrink-0" />
            <span className="text-sm text-[#1a1c1b]">{f.text}</span>
          </div>
        ))}
      </div>

      {/* Login button */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#3a6758] text-white py-4 rounded-2xl font-semibold text-base shadow-md active:scale-95 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z" fill="#FF3D00"/>
            <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.1 26.9 37 24 37c-5.1 0-9.4-3.1-11.2-7.5L6 35c3.3 6.8 10.1 10 18 10z" fill="#4CAF50"/>
            <path d="M44.5 20H24v8.5h11.8c-.8 2.5-2.4 4.6-4.5 6l6.6 5.4C41.8 36.5 45 31 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2"/>
          </svg>
          使用 Google 登入
        </button>
        <p className="text-xs text-center text-[#404945] px-4">
          登入即表示同意我們的服務條款。您的資料存放在個人 Google Drive，我們不會儲存任何私人檔案。
        </p>
      </div>

    </div>
  );
}
