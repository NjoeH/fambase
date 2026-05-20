"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import Icon from "@/components/Icon";

type DriveStatus = "disconnected" | "connecting" | "connected";

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { user, logout } = useAuth();
  const [driveStatus, setDriveStatus] = useState<DriveStatus>("disconnected");
  const [driveFolder, setDriveFolder] = useState("");
  const [lang, setLang] = useState(locale);

  function handleConnectDrive() {
    setDriveStatus("connecting");
    setTimeout(() => {
      setDriveStatus("connected");
      setDriveFolder("FamBase");
    }, 1500);
  }

  function handleDisconnectDrive() {
    setDriveStatus("disconnected");
    setDriveFolder("");
  }

  async function handleLogout() {
    await logout();
    router.replace(`/${locale}/login`);
  }

  return (
    <>
      {/* TopBar */}
      <header className="flex items-center gap-md px-lg py-sm sticky top-0 z-50 bg-surface shadow-sm">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
        >
          <Icon name="chevron_left" className="text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-primary">設定</h1>
      </header>

      <main className="px-container-padding pt-md max-w-2xl mx-auto pb-24 space-y-lg">

        {/* Google Drive 設定 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            Google Drive 儲存
          </h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden macaron-shadow">

            {/* 狀態列 */}
            <div className="p-md flex items-center gap-md border-b border-surface-variant/30">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                driveStatus === "connected" ? "bg-primary-container" : "bg-surface-container"
              }`}>
                <Icon name="folder" className={driveStatus === "connected" ? "text-primary" : "text-on-surface-variant"} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">Google Drive</p>
                <p className="text-xs text-on-surface-variant">
                  {driveStatus === "connected"
                    ? `已連結 · 資料夾：${driveFolder}`
                    : driveStatus === "connecting"
                    ? "連結中..."
                    : "尚未連結"}
                </p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${
                driveStatus === "connected" ? "bg-primary" :
                driveStatus === "connecting" ? "bg-tertiary animate-pulse" :
                "bg-outline"
              }`} />
            </div>

            {/* 說明 */}
            <div className="p-md bg-surface-container-low flex gap-sm">
              <Icon name="info" className="text-on-surface-variant text-lg shrink-0 mt-0.5" />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                附件（照片、掃描檔）將上傳至您個人的 Google Drive，FamBase 不會儲存任何檔案。
                所有家庭成員可透過分享連結開啟附件，無需 Google 帳號。
              </p>
            </div>

            {/* 操作按鈕 */}
            <div className="p-md">
              {driveStatus === "connected" ? (
                <div className="space-y-sm">
                  <div className="flex items-center gap-sm p-sm bg-surface-container rounded-lg">
                    <Icon name="folder_open" className="text-primary text-sm" />
                    <span className="text-sm text-on-surface flex-1">Drive 資料夾名稱</span>
                    <span className="text-sm font-semibold text-primary">{driveFolder}</span>
                  </div>
                  <button
                    onClick={handleDisconnectDrive}
                    className="w-full py-sm rounded-full border border-error text-error text-sm font-semibold hover:bg-error-container/30 transition-colors"
                  >
                    中斷連結
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectDrive}
                  disabled={driveStatus === "connecting"}
                  className="w-full py-sm bg-primary text-on-primary rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-sm"
                >
                  {driveStatus === "connecting" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      連結中...
                    </>
                  ) : (
                    <>
                      <Icon name="add_to_drive" className="text-sm" />
                      連結 Google Drive
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 語言設定 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            語言 / Language
          </h2>
          <div className="bg-white rounded-xl shadow-sm macaron-shadow overflow-hidden">
            {[
              { code: "zh", label: "繁體中文", sublabel: "Traditional Chinese" },
              { code: "en", label: "English", sublabel: "英文" },
            ].map((l, i, arr) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  router.push(`/${l.code}/settings`);
                }}
                className={`w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors ${
                  i < arr.length - 1 ? "border-b border-surface-variant/30" : ""
                }`}
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-on-surface">{l.label}</p>
                  <p className="text-xs text-on-surface-variant">{l.sublabel}</p>
                </div>
                {lang === l.code && (
                  <Icon name="check_circle" className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 通知設定（placeholder） */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            通知設定
          </h2>
          <div className="bg-white rounded-xl shadow-sm macaron-shadow overflow-hidden">
            {[
              { icon: "mail", label: "Email 通知", sub: "尚未設定" },
              { icon: "telegram", label: "Telegram 通知", sub: "尚未連結" },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={`flex items-center gap-md p-md ${i < arr.length - 1 ? "border-b border-surface-variant/30" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                  <Icon name={item.icon} className="text-on-surface-variant" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.sub}</p>
                </div>
                <Icon name="chevron_right" className="text-on-surface-variant" />
              </div>
            ))}
          </div>
        </section>

        {/* 帳號 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            帳號
          </h2>
          <div className="bg-white rounded-xl shadow-sm macaron-shadow overflow-hidden">
            <div className="flex items-center gap-md p-md border-b border-surface-variant/30">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ""}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-container"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <Icon name="person" className="text-primary" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">
                  {user?.displayName ?? "使用者"}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors text-error"
            >
              <Icon name="logout" className="text-error" />
              <span className="text-sm font-semibold">登出</span>
            </button>
          </div>
        </section>

      </main>
    </>
  );
}
