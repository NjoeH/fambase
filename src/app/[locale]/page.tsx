"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import { getFamilyName } from "@/lib/firestore";
import TopBar from "@/components/TopBar";
import ReminderItem from "@/components/home/ReminderItem";
import ModuleCard from "@/components/home/ModuleCard";
import ActivityItem from "@/components/home/ActivityItem";
import Icon from "@/components/Icon";

export default function HomePage() {
  const { user, loading, familyId, familyLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [familyName, setFamilyName] = useState("我的家庭");

  useEffect(() => {
    if (loading || familyLoading) return;
    if (!user) { router.replace(`/${locale}/login`); return; }
    if (!familyId) { router.replace(`/${locale}/onboarding`); return; }
  }, [user, loading, familyId, familyLoading, router, locale]);

  useEffect(() => {
    if (!familyId) return;
    getFamilyName(familyId).then((name) => { if (name) setFamilyName(name); });
  }, [familyId]);

  if (loading || familyLoading || !user || !familyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const reminders = [
    { icon: "bolt",             title: "台電帳單",  subtitle: "截止日：今天",  urgency: "high"   as const, urgencyLabel: "緊急" },
    { icon: "vacuum",           title: "吸塵器保固", subtitle: "截止日：3天後", urgency: "medium" as const, urgencyLabel: "中度" },
    { icon: "health_and_safety",title: "意外險續保", subtitle: "截止日：7天後", urgency: "low"    as const, urgencyLabel: "提醒" },
  ];

  const modules = [
    { icon: "receipt_long",        label: t("nav.bills"),     subtitle: "帳單管理",   bgCard: "bg-secondary-fixed/50",     bgIcon: "bg-secondary-container",    iconColor: "text-secondary",          labelColor: "text-on-secondary-fixed-variant", href: "/bills",     disabled: true },
    { icon: "directions_car",      label: t("nav.vehicles"),  subtitle: "車輛管理",   bgCard: "bg-primary-fixed/50",       bgIcon: "bg-primary-container",      iconColor: "text-primary",            labelColor: "text-on-primary-fixed-variant",   href: "/vehicles",  disabled: false },
    { icon: "enhanced_encryption", label: t("nav.documents"), subtitle: "重要文件",   bgCard: "bg-tertiary-fixed/50",      bgIcon: "bg-tertiary-container",     iconColor: "text-tertiary",           labelColor: "text-on-tertiary-fixed-variant",  href: "/documents", disabled: true },
    { icon: "home_work",           label: t("nav.property"),  subtitle: "不動產管理", bgCard: "bg-surface-container-high", bgIcon: "bg-surface-container",      iconColor: "text-on-surface-variant", labelColor: "text-on-surface-variant",          href: "/property",  disabled: false },
    { icon: "pets",                label: t("nav.pets"),      subtitle: "寵物健康",   bgCard: "bg-[#FFE5D9]",             bgIcon: "bg-[#FFD7C4]",              iconColor: "text-[#8B4513]",          labelColor: "text-[#8B4513]", subtitleColor: "text-[#8B4513]/70", href: "/pets",      disabled: false },
    { icon: "verified_user",       label: t("nav.warranty"),  subtitle: "保固管理",   bgCard: "bg-surface-container-low",  bgIcon: "bg-surface-container-high", iconColor: "text-on-surface-variant", labelColor: "text-on-surface-variant",          href: "/warranty",  disabled: false },
  ];

  return (
    <>
      <TopBar familyName={familyName} userAvatar={user.photoURL ?? undefined} />

      <main className="mt-20 px-container-padding max-w-7xl mx-auto space-y-lg pb-24">

        {/* 即將到期提醒 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            {t("home.upcomingReminders")}
          </h2>
          <div className="bg-tertiary-container/30 rounded-xl p-md macaron-shadow border border-tertiary-container/20">
            <div className="space-y-sm">
              {reminders.map((r) => (
                <ReminderItem key={r.title} {...r} />
              ))}
            </div>
          </div>
        </section>

        {/* 功能模組 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            功能模組
          </h2>
          <div className="grid grid-cols-2 gap-md">
            {modules.map((m) => (
              <ModuleCard key={m.label} {...m} />
            ))}
            {/* 緊急資訊 — full width */}
            <ModuleCard
              icon="emergency_home"
              label={t("nav.emergency")}
              subtitle="快速撥號與醫療資料"
              bgCard="bg-error-container/40"
              bgIcon="bg-error"
              iconColor="text-white"
              labelColor="text-on-error-container"
              subtitleColor="text-on-surface-variant"
              colSpan
              disabled
            />
          </div>
        </section>

        {/* 最近活動 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            最近活動
          </h2>
          <div className="bg-surface rounded-xl p-md macaron-shadow space-y-md border border-surface-variant/30">
            <ActivityItem
              avatar={user.photoURL ?? ""}
              avatarAlt={user.displayName ?? "我"}
              avatarBg="bg-primary-container"
              text={`${user.displayName ?? "你"} 建立了家庭群組`}
              time="剛剛"
            />
          </div>
        </section>

      </main>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-transform duration-150 z-50">
        <Icon name="add" className="text-3xl" />
      </button>

      <p className="fixed bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-on-surface-variant/30 z-40">v0.1.6</p>
    </>
  );
}
