"use client";

import { useTranslations } from "next-intl";
import TopBar from "@/components/TopBar";
import ReminderItem from "@/components/home/ReminderItem";
import ModuleCard from "@/components/home/ModuleCard";
import ActivityItem from "@/components/home/ActivityItem";
import Icon from "@/components/Icon";

export default function HomePage() {
  const t = useTranslations();

  const reminders = [
    { icon: "bolt",             title: "台電帳單",  subtitle: "截止日：今天",  urgency: "high"   as const, urgencyLabel: "緊急" },
    { icon: "vacuum",           title: "吸塵器保固", subtitle: "截止日：3天後", urgency: "medium" as const, urgencyLabel: "中度" },
    { icon: "health_and_safety",title: "意外險續保", subtitle: "截止日：7天後", urgency: "low"    as const, urgencyLabel: "提醒" },
  ];

  const modules = [
    { icon: "receipt_long",       label: t("nav.bills"),     subtitle: "$12,450 待繳",  bgCard: "bg-secondary-fixed/50",       bgIcon: "bg-secondary-container",       iconColor: "text-secondary",          labelColor: "text-on-secondary-fixed-variant", href: "/bills" },
    { icon: "directions_car",     label: t("nav.vehicles"),  subtitle: "2 台管理中",    bgCard: "bg-primary-fixed/50",         bgIcon: "bg-primary-container",         iconColor: "text-primary",            labelColor: "text-on-primary-fixed-variant",   href: "/vehicles" },
    { icon: "enhanced_encryption",label: t("nav.documents"), subtitle: "15 份加密文件", bgCard: "bg-tertiary-fixed/50",        bgIcon: "bg-tertiary-container",        iconColor: "text-tertiary",           labelColor: "text-on-tertiary-fixed-variant",  href: "/documents" },
    { icon: "home_work",          label: t("nav.property"),  subtitle: "3 項不動產",    bgCard: "bg-surface-container-high",   bgIcon: "bg-surface-container",         iconColor: "text-on-surface-variant", labelColor: "text-on-surface-variant",         href: "/property" },
    { icon: "pets",               label: t("nav.pets"),      subtitle: "最新疫苗：2月", bgCard: "bg-[#FFE5D9]",               bgIcon: "bg-[#FFD7C4]",                 iconColor: "text-[#8B4513]",          labelColor: "text-[#8B4513]", subtitleColor: "text-[#8B4513]/70", href: "/pets" },
    { icon: "verified_user",      label: t("nav.warranty"),  subtitle: "8 項有效保固",  bgCard: "bg-surface-container-low",    bgIcon: "bg-surface-container-high",    iconColor: "text-on-surface-variant", labelColor: "text-on-surface-variant",         href: "/warranty" },
  ];

  return (
    <>
      <TopBar familyName="林家大院" />

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
              avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuAlwXFksM8ijhdNQrLCm_yFFm7nz81tW19hQyOJ24h9TdSmrNBDoicUXxZX5Vre_nuY35RSxWEZDNCbKq1UEGgGw7y8IN_4NjMckV3cC_k7c8w5EQcghqkPtzsUKqvT2-DOghzNhWMxwSNb_M4SNfz62i16rBX96zwtu-JVuDfpAOxmeK5ts2ZuveJLge13pKj9SXyDDHeAj0kWbWuHX0PyBRsz7B7U4YykVUpti0aEXWmlsSsBCXLq7cZuSPOs7RRYpllcMoTra1s"
              avatarAlt="爸爸"
              avatarBg="bg-primary-container"
              text="爸爸上傳了新的車輛保險單"
              time="2小時前"
            />
            <div className="h-px bg-surface-variant/50 mx-2" />
            <ActivityItem
              avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB9zx16BX4P-Q91jG_JOWETNfSz60DHSzdccmYuswsDcOrt0CFPtFuqYs4a6VGEQ9Q8X_9qh9MWdVR8sd-2bXKlQXPsYz-mu05OG0sUnh0OPwmJ6C6q_8qMp-GQ8EqPLvDkIWwFIN23F05mW9CpH5p00hukTk7LexZETlcKvSWb4PmytpjRyT-O-b9kxLJNCFyx_A2t_b9uXBVPqbgBRAPC_YEt0gfKeZMckowjV5Y7KzVOra7QFk2li5LB4VbH-TGM_efkoyHbccI"
              avatarAlt="媽媽"
              avatarBg="bg-tertiary-container"
              text="媽媽已標記管理費為已支付"
              time="昨天 18:45"
            />
          </div>
        </section>

      </main>

      {/* FAB */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-transform duration-150 z-50">
        <Icon name="add" className="text-3xl" />
      </button>
    </>
  );
}
