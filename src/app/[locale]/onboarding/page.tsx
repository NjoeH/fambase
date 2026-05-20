"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import { createFamily, joinFamilyByCode } from "@/lib/firestore";
import Icon from "@/components/Icon";

type Step = "choose" | "create" | "join";

export default function OnboardingPage() {
  const { user, refreshFamilyId } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [step, setStep] = useState<Step>("choose");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleCreateFinish() {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await createFamily(familyName, user.uid, user.displayName ?? "", user.email ?? "");
      await refreshFamilyId();
      router.replace(`/${locale}`);
    } catch {
      setSubmitError("建立失敗，請再試一次");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoinFinish() {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await joinFamilyByCode(inviteCode, user.uid, user.displayName ?? "", user.email ?? "");
      if (!result) {
        setSubmitError("邀請碼無效，請確認後再試");
        return;
      }
      await refreshFamilyId();
      router.replace(`/${locale}`);
    } catch {
      setSubmitError("加入失敗，請再試一次");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Step: 選擇建立或加入 ──────────────────────
  if (step === "choose") {
    return (
      <OnboardingShell step={1} total={2} title="歡迎來到 FamBase" subtitle={`嗨，${user?.displayName?.split(" ")[0] ?? ""}！先幫你設定家庭群組`}>
        <div className="space-y-md">
          <button
            onClick={() => setStep("create")}
            className="w-full flex items-center gap-md bg-primary-fixed/50 border-2 border-primary-container rounded-2xl p-md text-left active:scale-95 transition-transform macaron-shadow"
          >
            <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shrink-0">
              <Icon name="add_home" className="text-primary text-2xl" />
            </div>
            <div>
              <p className="font-semibold text-on-primary-fixed-variant">建立新家庭</p>
              <p className="text-xs text-on-surface-variant">我是第一個加入的成員</p>
            </div>
            <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />
          </button>

          <button
            onClick={() => setStep("join")}
            className="w-full flex items-center gap-md bg-surface-container-low border-2 border-outline-variant rounded-2xl p-md text-left active:scale-95 transition-transform macaron-shadow"
          >
            <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center shrink-0">
              <Icon name="group_add" className="text-on-surface-variant text-2xl" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">加入現有家庭</p>
              <p className="text-xs text-on-surface-variant">我有邀請碼或邀請連結</p>
            </div>
            <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />
          </button>
        </div>
      </OnboardingShell>
    );
  }

  // ── Step: 建立家庭 ────────────────────────────
  if (step === "create") {
    return (
      <OnboardingShell step={2} total={2} title="建立家庭" subtitle="幫你的家庭取個名字" onBack={() => setStep("choose")}>
        <div className="space-y-md">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">家庭名稱</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="例如：林家大院"
              className="mt-sm w-full px-md py-sm rounded-xl border border-outline-variant bg-surface text-on-surface text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          {submitError && (
            <p className="text-sm text-error text-center">{submitError}</p>
          )}
          <button
            onClick={handleCreateFinish}
            disabled={!familyName.trim() || isSubmitting}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-40 active:scale-95 transition-transform macaron-shadow"
          >
            {isSubmitting ? "建立中..." : "建立家庭"}
          </button>
        </div>
      </OnboardingShell>
    );
  }

  // ── Step: 加入家庭 ────────────────────────────
  if (step === "join") {
    return (
      <OnboardingShell step={2} total={2} title="加入家庭" subtitle="輸入邀請碼或邀請連結" onBack={() => setStep("choose")}>
        <div className="space-y-md">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">邀請碼</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC-123"
              maxLength={7}
              className="mt-sm w-full px-md py-sm rounded-xl border border-outline-variant bg-surface text-on-surface text-base text-center tracking-widest font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-md">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant">或</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>
          <button className="w-full flex items-center justify-center gap-sm py-sm border border-outline-variant rounded-xl text-sm text-on-surface hover:bg-surface-container-low transition-colors">
            <Icon name="link" className="text-on-surface-variant" />
            貼上邀請連結
          </button>
          {submitError && (
            <p className="text-sm text-error text-center">{submitError}</p>
          )}
          <button
            disabled={inviteCode.length < 6 || isSubmitting}
            onClick={handleJoinFinish}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-40 active:scale-95 transition-transform macaron-shadow"
          >
            {isSubmitting ? "加入中..." : "加入家庭"}
          </button>
        </div>
      </OnboardingShell>
    );
  }

  return null;
}

// ── 共用外殼元件 ───────────────────────────────
function OnboardingShell({
  step, total, title, subtitle, onBack, children,
}: {
  step: number;
  total: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col px-container-padding py-xl max-w-[448px] mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-md mb-xl">
        {onBack && (
          <button onClick={onBack} className="p-xs rounded-full hover:bg-surface-container-high transition-colors">
            <Icon name="chevron_left" className="text-on-surface-variant" />
          </button>
        )}
        <div className="flex gap-xs flex-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-outline-variant"}`}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-xl">
        <h1 className="text-3xl font-bold text-on-surface">{title}</h1>
        <p className="text-base text-on-surface-variant mt-xs">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
