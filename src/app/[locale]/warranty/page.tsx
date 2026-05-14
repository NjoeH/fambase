"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Icon from "@/components/Icon";

type WarrantyStatus = "active" | "expiring" | "expired";

interface WarrantyItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  name: string;
  serial: string;
  purchaseDate: string;
  expiryDate: string;
  status: WarrantyStatus;
  category: "appliance" | "electronics" | "other";
}

const warranties: WarrantyItem[] = [
  { id: "1", icon: "kitchen", iconBg: "bg-primary-container", iconColor: "text-on-primary-container", name: "LG 變頻洗脫烘洗衣機", serial: "L-2023-WFH-001", purchaseDate: "2023.11.15", expiryDate: "2025.11.15", status: "active", category: "appliance" },
  { id: "2", icon: "laptop_mac", iconBg: "bg-secondary-container", iconColor: "text-on-secondary-container", name: 'MacBook Pro 14" (M3)', serial: "APPLE-MBP14-2023", purchaseDate: "2023.03.20", expiryDate: "2024.03.20", status: "expiring", category: "electronics" },
  { id: "3", icon: "smartphone", iconBg: "bg-surface-container-highest", iconColor: "text-on-surface-variant", name: "iPhone 13 Pro Max", serial: "A15-PRO-652391", purchaseDate: "2021.09.28", expiryDate: "2022.09.28", status: "expired", category: "electronics" },
  { id: "4", icon: "coffee_maker", iconBg: "bg-tertiary-fixed", iconColor: "text-on-tertiary-fixed-variant", name: "Breville 義式咖啡機", serial: "BRV-870-XL-BLACK", purchaseDate: "2023.08.10", expiryDate: "2024.08.10", status: "active", category: "other" },
  { id: "5", icon: "ac_unit", iconBg: "bg-primary-container", iconColor: "text-on-primary-container", name: "Dyson Purifier Cool", serial: "DY-TP07-WHITE", purchaseDate: "2022.05.02", expiryDate: "2024.05.02", status: "expiring", category: "appliance" },
];

const statusConfig = {
  active:   { label: "保固中",   bg: "bg-primary-container",          text: "text-on-primary-container" },
  expiring: { label: "即將到期", bg: "bg-tertiary-container",         text: "text-on-tertiary-container" },
  expired:  { label: "已過保",   bg: "bg-surface-container-highest",  text: "text-on-surface-variant" },
};

const categories = [
  { key: "all",         label: "全部" },
  { key: "appliance",   label: "家電" },
  { key: "electronics", label: "3C" },
  { key: "other",       label: "其他" },
];

export default function WarrantyPage() {
  const router = useRouter();
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? warranties
    : warranties.filter((w) => w.category === activeCategory);

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
          <h1 className="text-2xl font-bold text-primary">保固記錄</h1>
        </div>
        <button className="p-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
          <Icon name="notifications" className="text-primary" />
        </button>
      </header>

      <main className="px-container-padding pt-lg max-w-5xl mx-auto pb-24">

        {/* Category tabs */}
        <div className="flex gap-sm overflow-x-auto pb-xs mb-lg" style={{ scrollbarWidth: "none" }}>
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`px-lg py-sm rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                activeCategory === c.key
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Warranty grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filtered.map((w) => {
            const status = statusConfig[w.status];
            return (
              <div
                key={w.id}
                className={`bg-surface p-lg rounded-xl macaron-shadow flex flex-col gap-md ${w.status === "expired" ? "opacity-75" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-xs ${w.iconBg} rounded-lg`}>
                    <Icon name={w.icon} className={w.iconColor} />
                  </div>
                  <span className={`px-md py-1 rounded-full ${status.bg} ${status.text} text-xs font-semibold`}>
                    {status.label}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base mb-xs">{w.name}</h3>
                  <p className="text-on-surface-variant text-xs">序號：{w.serial}</p>
                </div>

                <div className="space-y-sm py-md border-y border-surface-container">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">購買日期</span>
                    <span className="font-semibold">{w.purchaseDate}</span>
                  </div>
                  <div className={`flex justify-between text-sm ${w.status === "expiring" ? "text-error" : ""}`}>
                    <span className={w.status !== "expiring" ? "text-on-surface-variant" : ""}>保固到期</span>
                    <span className="font-semibold">{w.expiryDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-md pt-xs">
                  <button className="flex-1 flex items-center justify-center gap-xs text-secondary text-sm font-semibold hover:underline">
                    <Icon name="receipt_long" className="text-lg" />
                    檢視發票
                  </button>
                  {w.status !== "expired" && (
                    <>
                      <div className="w-px h-4 bg-outline-variant" />
                      <button className="flex-1 flex items-center justify-center gap-xs text-secondary text-sm font-semibold hover:underline">
                        <Icon name={w.status === "expiring" ? "verified" : "image"} className="text-lg" />
                        {w.status === "expiring" ? "加購保固" : "保固卡"}
                      </button>
                    </>
                  )}
                  {w.status === "expired" && (
                    <button className="flex-1 flex items-center justify-center gap-xs text-secondary text-sm font-semibold hover:underline">
                      <Icon name="history" className="text-lg" />
                      維修紀錄
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add placeholder */}
          <div className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-xl text-on-surface-variant hover:border-primary hover:text-primary transition-all cursor-pointer group min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-md group-hover:bg-primary-container transition-colors">
              <Icon name="add_circle" className="text-3xl" />
            </div>
            <p className="text-sm font-semibold">新增更多設備</p>
          </div>
        </div>

      </main>

      {/* FAB */}
      <button className="fixed right-container-padding bottom-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="add" className="text-3xl" />
      </button>
    </>
  );
}
