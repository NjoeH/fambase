"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Icon from "@/components/Icon";
import VehicleCard from "@/components/vehicles/VehicleCard";
import StatCard from "@/components/vehicles/StatCard";
import FuelChart from "@/components/vehicles/FuelChart";

const vehicles = [
  { id: "1", name: "Model Y", plate: "ABC-1234", icon: "electric_car" },
  { id: "2", name: "Corolla", plate: "DEF-5678", icon: "directions_car" },
];

export default function VehiclesPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [activeId, setActiveId] = useState("1");
  const active = vehicles.find((v) => v.id === activeId)!;
  const isElectric = active.icon === "electric_car";

  return (
    <>
      {/* TopBar */}
      <header className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface shadow-sm">
        <div className="flex items-center gap-md">
          <button
            onClick={() => router.push(`/${locale}`)}
            className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
          >
            <Icon name="chevron_left" className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-primary">{t("vehicles.title")}</h1>
        </div>
        <button className="p-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
          <Icon name="notifications" className="text-primary" />
        </button>
      </header>

      <main className="px-container-padding pt-md max-w-5xl mx-auto pb-24">

        {/* 車庫切換 */}
        <section className="mb-lg">
          <h2 className="text-sm font-semibold text-on-surface-variant mb-sm">{t("vehicles.myGarage")}</h2>
          <div className="flex gap-md overflow-x-auto pb-xs" style={{ scrollbarWidth: "none" }}>
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                {...v}
                active={v.id === activeId}
                onClick={() => setActiveId(v.id)}
              />
            ))}
            {/* 新增 */}
            <div className="flex-shrink-0 w-16 p-md rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-dashed border-outline hover:bg-surface-container-highest transition-colors cursor-pointer">
              <Icon name="add" className="text-outline" />
            </div>
          </div>
        </section>

        {/* 車輛主卡片 + 側邊提醒 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
          {/* Hero card */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-lg flex flex-col md:flex-row gap-lg items-center relative overflow-hidden">
            <div className="flex-1 space-y-md">
              <div>
                <h2 className="text-3xl font-semibold text-primary">
                  {active.name === "Model Y" ? "Tesla Model Y" : "Toyota Corolla"}
                </h2>
                <p className="text-base text-on-surface-variant">目前狀態：已上鎖 ・ 已停車</p>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-surface-container-low p-md rounded-lg">
                  <div className="flex items-center gap-xs text-on-surface-variant text-sm font-semibold mb-xs">
                    <Icon name={isElectric ? "bolt" : "local_gas_station"} className="text-primary" />
                    {isElectric ? "電量" : "油量"}
                  </div>
                  <div className="text-2xl font-semibold">{isElectric ? "82%" : "65%"}</div>
                </div>
                <div className="bg-surface-container-low p-md rounded-lg">
                  <div className="flex items-center gap-xs text-on-surface-variant text-sm font-semibold mb-xs">
                    <Icon name="speed" className="text-primary" />
                    里程
                  </div>
                  <div className="text-2xl font-semibold">
                    {isElectric ? "12,450" : "38,200"}
                    <span className="text-xs font-normal ml-1">km</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xs flex items-center justify-center">
              <Icon name={active.icon} className="text-primary-container text-[120px]" />
            </div>
          </div>

          {/* 側邊提醒卡 */}
          <div className="flex flex-col gap-md">
            <div className="bg-tertiary-container text-on-tertiary-container p-lg rounded-xl shadow-sm flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="flex justify-between items-start">
                  <Icon name="warning" className="text-tertiary" />
                  <span className="text-xs font-bold uppercase">提醒</span>
                </div>
                <h3 className="text-lg font-semibold mt-sm">保險即將到期</h3>
                <p className="text-xs opacity-90">剩餘 14 天 (2024/12/15)</p>
              </div>
              <button className="w-full py-sm bg-tertiary text-on-tertiary rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                立即續保
              </button>
            </div>
            <div className="bg-secondary-container text-on-secondary-container p-lg rounded-xl shadow-sm flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="flex justify-between items-start">
                  <Icon name="build" className="text-secondary" />
                  <span className="text-xs font-bold uppercase">保養</span>
                </div>
                <h3 className="text-lg font-semibold mt-sm">例行檢查預約</h3>
                <p className="text-xs opacity-90">下次保養：{isElectric ? "15,000 km" : "40,000 km"}</p>
              </div>
              <button className="w-full py-sm bg-secondary text-on-secondary rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                預約保養
              </button>
            </div>
          </div>
        </section>

        {/* 圖表 + 統計 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <FuelChart title={isElectric ? "電耗趨勢" : "油耗趨勢"} />
          <div className="grid grid-cols-2 gap-md">
            <StatCard icon={isElectric ? "ev_station" : "local_gas_station"} label="本月費用" value="$2,450" />
            <StatCard icon="tire_repair" label="胎壓狀態" value="正常" />
            <StatCard icon="location_on" label="最後位置" value="台北市信義區" />
            <StatCard icon="history" label="近期駕駛" value="4.2" unit="h/d" />
          </div>
        </section>

      </main>

      {/* FAB */}
      <button className="fixed right-container-padding bottom-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="add" />
      </button>
    </>
  );
}
