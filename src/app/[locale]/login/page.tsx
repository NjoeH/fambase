"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/AuthContext";
import Icon from "@/components/Icon";

export default function LoginPage() {
  const { user, loading, familyId, familyLoading, signInWithGoogleToken } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (loading || familyLoading) return;
    if (!user) return;
    if (familyId) {
      router.replace(`/${locale}`);
    } else {
      router.replace(`/${locale}/onboarding`);
    }
  }, [user, loading, familyId, familyLoading, router, locale]);

  if (loading || familyLoading) {
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
      <div className="w-full max-w-[384px] space-y-2 mb-8">
        {[
          { icon: "receipt_long",         text: "帳單、保固、車輛集中管理" },
          { icon: "cloud_upload",          text: "照片、發票安全存放於雲端" },
          { icon: "notifications_active", text: "到期前自動提醒，不漏接" },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-4 bg-[#f3f4f1] rounded-xl px-4 py-3">
            <Icon name={f.icon} className="text-[#3a6758] shrink-0" />
            <span className="text-sm text-[#1a1c1b]">{f.text}</span>
          </div>
        ))}
      </div>

      {/* Login — GoogleLogin 按鈕（自動用 FedCM / One Tap，不需要 popup 權限） */}
      <div className="w-full max-w-[384px] space-y-3 flex flex-col items-center">
        <GoogleLogin
          onSuccess={async (res) => {
            if (res.credential) {
              await signInWithGoogleToken(res.credential, true);
            }
          }}
          onError={console.error}
          width="384"
          text="signin_with"
          shape="rectangular"
          size="large"
        />
        <p className="text-xs text-center text-[#404945] px-4">
          登入即表示同意我們的服務條款。
        </p>
      </div>

      <p className="mt-8 text-xs text-[#404945]/50">v0.1.5</p>

    </div>
  );
}
