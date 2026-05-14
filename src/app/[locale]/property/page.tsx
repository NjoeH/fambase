"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Icon from "@/components/Icon";

const maintenanceRecords = [
  {
    id: "1",
    title: "廚房系統櫃裝修",
    desc: "更換全套櫥櫃門片，加裝內嵌式洗碗機與RO淨水系統。",
    cost: "NT$ 185,000",
    date: "2023/09/12",
    contractor: "立峰室內設計工程",
    icon: "kitchen",
  },
  {
    id: "2",
    title: "客廳漏水維修",
    desc: "窗框滲水填補灌漿，處理壁癌及重新粉刷防水漆。",
    cost: "NT$ 12,000",
    date: "2023/07/05",
    contractor: "嘉宏防水工程部",
    icon: "plumbing",
  },
  {
    id: "3",
    title: "主臥室地板更換",
    desc: "拆除舊磁磚，改鋪超耐磨木地板，含踢腳板與收邊條。",
    cost: "NT$ 48,000",
    date: "2023/04/18",
    contractor: "永昌地板工程行",
    icon: "grid_on",
  },
];

const attachments = [
  { icon: "description",   label: "廚房裝修工程合約.pdf", size: "1.2 MB", date: "2023/09/10" },
  { icon: "receipt_long",  label: "水電維修收據_0705.jpg", size: "450 KB",  date: "2023/07/05" },
  { icon: "policy",        label: "房屋火險保單 2023.pdf", size: "2.8 MB",  date: "2023/01/15" },
];

export default function PropertyPage() {
  const router = useRouter();
  const locale = useLocale();

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
          <h1 className="text-2xl font-bold text-primary">房屋管理</h1>
        </div>
        <button className="p-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
          <Icon name="notifications" className="text-primary" />
        </button>
      </header>

      <main className="px-container-padding pt-lg max-w-5xl mx-auto pb-24 space-y-lg">

        {/* Hero summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* Mortgage card */}
          <section className="md:col-span-2 bg-white rounded-xl macaron-shadow p-lg flex flex-col justify-between border border-surface-container">
            <div>
              <div className="flex justify-between items-start mb-md">
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-xs">房貸繳交紀錄</p>
                  <p className="text-3xl font-bold text-primary">NT$ 42,500</p>
                </div>
                <span className="px-md py-xs bg-primary-container text-on-primary-container text-xs rounded-full flex items-center gap-xs font-semibold">
                  <Icon name="check_circle" className="text-base" />
                  自動提醒已開啟
                </span>
              </div>
              <div className="flex items-center gap-sm text-sm text-on-surface-variant">
                <Icon name="event_upcoming" className="text-primary" />
                <span>下次繳費日期：2023年11月15日</span>
              </div>
            </div>
            <div className="mt-xl flex gap-sm">
              <button className="flex-1 bg-primary text-on-primary py-sm rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity active:scale-95">
                立即繳費
              </button>
              <button className="px-md border border-outline-variant text-on-surface-variant py-sm rounded-lg font-semibold text-sm hover:bg-surface-container transition-colors active:scale-95">
                查看詳情
              </button>
            </div>
          </section>

          {/* Tax reminders */}
          <section className="bg-secondary-container text-on-secondary-container rounded-xl macaron-shadow p-lg flex flex-col justify-between">
            <h3 className="text-sm font-bold mb-md flex items-center gap-xs">
              <Icon name="account_balance" />
              稅務到期提醒
            </h3>
            <div className="space-y-md">
              <div className="bg-white/40 p-sm rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-xs opacity-80">地價稅 (11月開徵)</p>
                <p className="text-2xl font-bold">NT$ 3,240</p>
                <p className="text-xs mt-xs font-semibold">截止日期：11/30</p>
              </div>
              <div className="bg-white/40 p-sm rounded-lg backdrop-blur-sm border border-white/20 opacity-60">
                <p className="text-xs">房屋稅 (5月開徵)</p>
                <p className="text-lg font-bold">NT$ 8,120</p>
                <p className="text-xs">已完成繳納</p>
              </div>
            </div>
          </section>
        </div>

        {/* Maintenance + Attachments bento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">

          {/* Maintenance records */}
          <section className="lg:col-span-2 space-y-md">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-on-surface">裝潢與修繕紀錄</h2>
              <button className="text-primary font-semibold text-sm flex items-center gap-xs hover:underline">
                <Icon name="add" className="text-base" />
                新增紀錄
              </button>
            </div>

            <div className="space-y-md">
              {maintenanceRecords.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl macaron-shadow p-md flex gap-md items-start border border-transparent hover:border-primary-container transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-lg bg-primary-container/40 flex items-center justify-center flex-shrink-0">
                    <Icon name={r.icon} className="text-primary text-3xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-xs gap-md">
                      <h3 className="font-bold text-base text-on-surface">{r.title}</h3>
                      <span className="text-primary font-bold text-sm whitespace-nowrap">{r.cost}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm mb-sm line-clamp-2">{r.desc}</p>
                    <div className="flex items-center gap-md text-xs text-outline">
                      <span className="flex items-center gap-xs">
                        <Icon name="calendar_today" className="text-sm" />
                        {r.date}
                      </span>
                      <span className="flex items-center gap-xs">
                        <Icon name="person" className="text-sm" />
                        {r.contractor}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Attachments */}
          <section className="space-y-md">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-on-surface">附件管理</h2>
              <button className="text-primary font-semibold text-sm flex items-center gap-xs hover:underline">
                <Icon name="cloud_upload" className="text-base" />
                上傳
              </button>
            </div>

            <div className="bg-tertiary-container/30 rounded-xl p-md border border-tertiary-container/50 space-y-sm">
              <p className="text-xs font-semibold text-on-tertiary-container mb-md">合約與收據 ({attachments.length})</p>
              {attachments.map((a) => (
                <div key={a.label} className="bg-white p-sm rounded-lg flex items-center justify-between macaron-shadow group">
                  <div className="flex items-center gap-sm min-w-0">
                    <Icon name={a.icon} className="text-on-secondary-container" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{a.label}</p>
                      <p className="text-xs text-outline">{a.size} · {a.date}</p>
                    </div>
                  </div>
                  <button className="p-xs text-outline hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Icon name="visibility" />
                  </button>
                </div>
              ))}
              <div className="mt-md pt-sm border-t border-tertiary-container/30">
                <p className="text-xs text-on-tertiary-container italic">所有文件均已安全加密存儲於雲端空間</p>
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
