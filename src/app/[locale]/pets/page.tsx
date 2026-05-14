"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Icon from "@/components/Icon";

const vaccines = [
  { name: "狂犬病疫苗", done: true },
  { name: "五合一疫苗", done: true },
  { name: "萊姆病疫苗", done: false },
];

const expenses = [
  { label: "飼料與點心", pct: 60, color: "bg-primary", svgColor: "#3a6758" },
  { label: "寵物美容",   pct: 25, color: "bg-secondary", svgColor: "#645787" },
  { label: "醫療保健",   pct: 15, color: "bg-tertiary-container", svgColor: "#f2c0c8" },
];

const attachments = [
  { icon: "badge",        label: "寵物登記證" },
  { icon: "health_and_safety", label: "健康手冊" },
  { icon: "vaccine",      label: "疫苗紀錄本" },
];

export default function PetsPage() {
  const router = useRouter();
  const locale = useLocale();

  // SVG donut chart — 3 segments
  const radius = 15.915;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = expenses.map((e) => {
    const dash = (e.pct / 100) * circumference;
    const seg = { ...e, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface shadow-sm">
        <div className="flex items-center gap-md">
          <button
            onClick={() => router.push(`/${locale}`)}
            className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
          >
            <Icon name="chevron_left" className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-primary">寵物管理</h1>
        </div>
        <button className="p-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
          <Icon name="notifications" className="text-primary" />
        </button>
      </header>

      <main className="px-container-padding pt-lg max-w-5xl mx-auto pb-24 space-y-lg">

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">

          {/* Pet profile card */}
          <section className="md:col-span-8 bg-white rounded-xl macaron-shadow overflow-hidden flex flex-col md:flex-row">
            {/* Photo placeholder */}
            <div className="md:w-1/2 h-56 md:h-auto bg-primary-container flex items-center justify-center">
              <Icon name="pets" className="text-primary text-[96px]" />
            </div>

            <div className="p-lg md:w-1/2 flex flex-col justify-center space-y-md">
              <div className="space-y-xs">
                <span className="text-xs font-semibold bg-primary-container text-on-primary-container px-sm py-xs rounded-full">
                  黃金獵犬
                </span>
                <h2 className="text-3xl font-bold text-primary mt-xs">Mochi</h2>
              </div>

              <div className="space-y-sm">
                <div className="flex items-center gap-sm text-on-surface-variant">
                  <Icon name="fingerprint" className="text-primary" />
                  <span className="text-sm">晶片號碼: 900215000123456</span>
                </div>
                <div className="flex items-center gap-sm text-on-surface-variant">
                  <Icon name="cake" className="text-primary" />
                  <span className="text-sm">生日: 2021年5月20日</span>
                </div>
                <div className="flex items-center gap-sm text-on-surface-variant">
                  <Icon name="male" className="text-primary" />
                  <span className="text-sm">性別: 公 ・ 已結紮</span>
                </div>
              </div>

              <button className="w-full py-md bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95">
                編輯檔案
              </button>
            </div>
          </section>

          {/* Health reminders */}
          <section className="md:col-span-4 bg-white rounded-xl macaron-shadow p-lg flex flex-col">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-lg font-bold text-on-surface">健康提醒</h3>
              <Icon name="event_note" className="text-primary" />
            </div>

            <div className="space-y-md flex-1">
              <div className="p-md rounded-lg bg-tertiary-container/30 border-l-4 border-tertiary">
                <p className="text-xs font-semibold text-on-tertiary-container">下次預約回診</p>
                <p className="text-xl font-bold text-tertiary">2023.11.15</p>
                <p className="text-xs text-on-tertiary-container mt-xs">年度健康檢查 @ 幸福動物醫院</p>
              </div>

              <div className="space-y-xs">
                <p className="text-xs font-semibold text-on-surface-variant">疫苗紀錄</p>
                {vaccines.map((v) => (
                  <div key={v.name} className="flex items-center justify-between p-sm border-b border-surface-container">
                    <span className="text-sm">{v.name}</span>
                    <span className={`text-xs font-semibold ${v.done ? "text-primary" : "text-error"}`}>
                      {v.done ? "已完成" : "未接種"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Expense statistics */}
          <section className="md:col-span-7 bg-white rounded-xl macaron-shadow p-lg">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-lg font-bold text-on-surface">本月花費統計</h3>
              <span className="text-xs text-on-surface-variant">總計 NT$ 4,200</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-xl">
              {/* Donut chart */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r={radius} fill="transparent" stroke="#edeeeb" strokeWidth="4" />
                  {segments.map((s) => (
                    <circle
                      key={s.label}
                      cx="18" cy="18"
                      r={radius}
                      fill="transparent"
                      stroke={s.svgColor}
                      strokeWidth="4"
                      strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                      strokeDashoffset={circumference - s.offset}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-sm font-bold text-primary">本月</span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-1 gap-md flex-1 w-full">
                {expenses.map((e) => (
                  <div key={e.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className={`w-3 h-3 rounded-full ${e.color}`} />
                      <span className="text-sm">{e.label}</span>
                    </div>
                    <span className="text-sm font-semibold">{e.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Attachments */}
          <section className="md:col-span-5 bg-white rounded-xl macaron-shadow p-lg">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-lg font-bold text-on-surface">證件附件</h3>
              <button className="p-xs rounded-full hover:bg-primary-container transition-colors text-primary active:scale-95">
                <Icon name="add_circle" className="text-primary" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-md">
              {attachments.map((a) => (
                <div
                  key={a.label}
                  className="group aspect-[3/4] bg-surface-container rounded-lg flex flex-col items-center justify-center gap-sm border border-outline-variant/30 cursor-pointer hover:bg-primary-container/20 transition-colors"
                >
                  <Icon name={a.icon} className="text-primary text-4xl" />
                  <span className="text-xs font-semibold text-on-surface">{a.label}</span>
                </div>
              ))}
              <div className="group aspect-[3/4] border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center gap-sm cursor-pointer hover:border-primary hover:text-primary transition-colors text-on-surface-variant">
                <Icon name="add" className="text-2xl" />
                <span className="text-xs font-semibold">上傳文件</span>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* FAB */}
      <button className="fixed right-container-padding bottom-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="add" className="text-3xl" />
      </button>
    </>
  );
}
