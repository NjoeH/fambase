"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import Icon from "@/components/Icon";

export default function JoinPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";

  const [status, setStatus] = useState<"idle" | "joining" | "done" | "error">("idle");

  // 已登入才能加入
  async function handleJoin() {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setStatus("joining");
    // 之後接 Firestore 驗證邀請碼
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("done");
    setTimeout(() => router.replace(`/${locale}`), 1000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-container-padding">
      <div className="w-full max-w-sm space-y-lg">

        {/* Icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mx-auto mb-md macaron-shadow">
            <Icon name="group_add" className="text-primary text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface">加入家庭</h1>
          <p className="text-base text-on-surface-variant mt-xs">你收到了一個 FamBase 邀請</p>
        </div>

        {/* 邀請碼顯示 */}
        {code && (
          <div className="bg-primary-container/40 rounded-xl p-md text-center">
            <p className="text-xs text-on-surface-variant mb-xs">邀請碼</p>
            <p className="text-2xl font-bold tracking-widest text-primary">{code}</p>
          </div>
        )}

        {/* 狀態 */}
        {status === "done" ? (
          <div className="flex items-center justify-center gap-sm text-primary">
            <Icon name="check_circle" className="text-2xl" />
            <span className="font-semibold">加入成功！跳轉中...</span>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={status === "joining"}
            className="w-full flex items-center justify-center gap-md py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-60 active:scale-95 transition-transform macaron-shadow"
          >
            {status === "joining" ? (
              <>
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                加入中...
              </>
            ) : user ? (
              <>
                <Icon name="group_add" />
                確認加入
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107"/>
                  <path d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z" fill="#FF3D00"/>
                  <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.1 26.9 37 24 37c-5.1 0-9.4-3.1-11.2-7.5L6 35c3.3 6.8 10.1 10 18 10z" fill="#4CAF50"/>
                  <path d="M44.5 20H24v8.5h11.8c-.8 2.5-2.4 4.6-4.5 6l6.6 5.4C41.8 36.5 45 31 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2"/>
                </svg>
                用 Google 登入並加入
              </>
            )}
          </button>
        )}

        <p className="text-xs text-center text-on-surface-variant">
          加入後可在設定中切換或離開家庭群組
        </p>
      </div>
    </div>
  );
}
