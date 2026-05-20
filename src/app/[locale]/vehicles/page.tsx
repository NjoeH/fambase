"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import {
  getVehicles, addVehicle, deleteVehicle,
  Vehicle, VehicleData,
} from "@/lib/firestore";
import Icon from "@/components/Icon";
import VehicleCard from "@/components/vehicles/VehicleCard";
import StatCard from "@/components/vehicles/StatCard";
import FuelChart from "@/components/vehicles/FuelChart";
import Modal from "@/components/Modal";

function daysUntil(dateStr: string): number {
  if (!dateStr) return Infinity;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

const emptyForm: VehicleData = {
  name: "", plate: "", type: "gas", fuelPct: 100, mileage: 0, insuranceExpiry: "",
};

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-xs">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function VehiclesPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { familyId } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VehicleData>(emptyForm);

  useEffect(() => {
    if (!familyId) return;
    getVehicles(familyId)
      .then((v) => {
        setVehicles(v);
        if (v.length > 0) setActiveId(v[0].id);
      })
      .finally(() => setLoading(false));
  }, [familyId]);

  const active = vehicles.find((v) => v.id === activeId) ?? null;
  const isElectric = active?.type === "electric";
  const insuranceDays = active ? daysUntil(active.insuranceExpiry) : Infinity;

  async function handleAdd() {
    if (!familyId || !form.name || !form.plate) return;
    setSaving(true);
    try {
      const id = await addVehicle(familyId, form);
      const newV: Vehicle = { id, ...form };
      setVehicles((prev) => [...prev, newV]);
      setActiveId(id);
      setShowAdd(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(vehicleId: string) {
    if (!familyId) return;
    await deleteVehicle(familyId, vehicleId);
    setVehicles((prev) => {
      const next = prev.filter((v) => v.id !== vehicleId);
      setActiveId(next.length > 0 ? next[0].id : null);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface shadow-sm">
        <div className="flex items-center gap-md">
          <button onClick={() => router.push(`/${locale}`)} className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
            <Icon name="chevron_left" className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-primary">{t("vehicles.title")}</h1>
        </div>
      </header>

      <main className="px-container-padding pt-md max-w-5xl mx-auto pb-24">

        {/* 車庫 */}
        <section className="mb-lg">
          <h2 className="text-sm font-semibold text-on-surface-variant mb-sm">{t("vehicles.myGarage")}</h2>
          <div className="flex gap-md overflow-x-auto pb-xs" style={{ scrollbarWidth: "none" }}>
            {vehicles.map((v) => (
              <div key={v.id} className="relative group flex-shrink-0">
                <VehicleCard
                  name={v.name}
                  plate={v.plate}
                  icon={v.type === "electric" ? "electric_car" : "directions_car"}
                  active={v.id === activeId}
                  onClick={() => setActiveId(v.id)}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
                  className="absolute top-xs right-xs w-6 h-6 bg-error text-white rounded-full items-center justify-center hidden group-hover:flex transition-all text-xs z-10"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              </div>
            ))}
            <div
              onClick={() => setShowAdd(true)}
              className="flex-shrink-0 w-16 p-md rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-dashed border-outline hover:bg-surface-container-highest transition-colors cursor-pointer"
            >
              <Icon name="add" className="text-outline" />
            </div>
          </div>
        </section>

        {/* Empty state */}
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant space-y-md">
            <Icon name="directions_car" className="text-7xl opacity-20" />
            <p className="text-base font-semibold">尚未新增車輛</p>
            <button onClick={() => setShowAdd(true)} className="px-xl py-sm bg-primary text-on-primary rounded-2xl font-semibold text-sm active:scale-95 transition-transform">
              新增第一台車
            </button>
          </div>
        ) : active && (
          <>
            {/* 車輛主卡片 + 側邊提醒 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
              <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-lg flex flex-col md:flex-row gap-lg items-center">
                <div className="flex-1 space-y-md">
                  <div>
                    <h2 className="text-3xl font-semibold text-primary">{active.name}</h2>
                    <p className="text-base text-on-surface-variant">{active.plate}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="bg-surface-container-low p-md rounded-lg">
                      <div className="flex items-center gap-xs text-on-surface-variant text-sm font-semibold mb-xs">
                        <Icon name={isElectric ? "bolt" : "local_gas_station"} className="text-primary" />
                        {isElectric ? "電量" : "油量"}
                      </div>
                      <div className="text-2xl font-semibold">{active.fuelPct}%</div>
                    </div>
                    <div className="bg-surface-container-low p-md rounded-lg">
                      <div className="flex items-center gap-xs text-on-surface-variant text-sm font-semibold mb-xs">
                        <Icon name="speed" className="text-primary" />
                        里程
                      </div>
                      <div className="text-2xl font-semibold">
                        {active.mileage.toLocaleString()}
                        <span className="text-xs font-normal ml-1">km</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-[280px] flex items-center justify-center">
                  <Icon name={isElectric ? "electric_car" : "directions_car"} className="text-primary-container text-[120px]" />
                </div>
              </div>

              <div className="flex flex-col gap-md">
                <div className={`${insuranceDays <= 30 ? "bg-tertiary-container text-on-tertiary-container" : "bg-primary-container/40 text-on-primary-container"} p-lg rounded-xl shadow-sm flex flex-col justify-between min-h-[160px]`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <Icon name={insuranceDays <= 30 ? "warning" : "verified_user"} className={insuranceDays <= 30 ? "text-tertiary" : "text-primary"} />
                      <span className="text-xs font-bold uppercase">保險</span>
                    </div>
                    <h3 className="text-lg font-semibold mt-sm">
                      {insuranceDays <= 0 ? "保險已過期" : insuranceDays <= 30 ? "保險即將到期" : "保險有效"}
                    </h3>
                    <p className="text-xs opacity-80 mt-xs">
                      {active.insuranceExpiry
                        ? `${active.insuranceExpiry.replace(/-/g, "/")}${insuranceDays > 0 ? ` · 剩 ${insuranceDays} 天` : ""}`
                        : "尚未設定到期日"}
                    </p>
                  </div>
                </div>
                <div className="bg-secondary-container text-on-secondary-container p-lg rounded-xl shadow-sm flex flex-col justify-between min-h-[160px]">
                  <div>
                    <div className="flex justify-between items-start">
                      <Icon name="build" className="text-secondary" />
                      <span className="text-xs font-bold uppercase">保養</span>
                    </div>
                    <h3 className="text-lg font-semibold mt-sm">例行檢查</h3>
                    <p className="text-xs opacity-90">依廠商建議定期保養</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 圖表 + 統計 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <FuelChart title={isElectric ? "電耗趨勢" : "油耗趨勢"} />
              <div className="grid grid-cols-2 gap-md">
                <StatCard icon={isElectric ? "ev_station" : "local_gas_station"} label="本月費用" value="—" />
                <StatCard icon="tire_repair" label="胎壓狀態" value="正常" />
                <StatCard icon="location_on" label="最後位置" value="—" />
                <StatCard icon="history" label="近期駕駛" value="—" />
              </div>
            </section>
          </>
        )}
      </main>

      <button onClick={() => setShowAdd(true)} className="fixed right-container-padding bottom-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="add" />
      </button>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="新增車輛">
        <div className="space-y-md">
          <InputField label="車輛名稱 *">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="例：Tesla Model Y" className={inputCls} />
          </InputField>
          <InputField label="車牌號碼 *">
            <input value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))} placeholder="例：ABC-1234" className={inputCls} />
          </InputField>
          <InputField label="種類">
            <div className="flex gap-sm">
              {(["gas", "electric"] as const).map((tp) => (
                <button key={tp} onClick={() => setForm((f) => ({ ...f, type: tp }))}
                  className={`flex-1 py-sm rounded-xl text-sm font-semibold transition-colors ${form.type === tp ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                  {tp === "gas" ? "油車" : "電動車"}
                </button>
              ))}
            </div>
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="里程 (km)">
              <input type="number" value={form.mileage || ""} onChange={(e) => setForm((f) => ({ ...f, mileage: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </InputField>
            <InputField label={form.type === "electric" ? "電量 (%)" : "油量 (%)"}>
              <input type="number" min={0} max={100} value={form.fuelPct || ""} onChange={(e) => setForm((f) => ({ ...f, fuelPct: Math.min(100, Number(e.target.value)) }))} placeholder="100" className={inputCls} />
            </InputField>
          </div>
          <InputField label="保險到期日">
            <input type="date" value={form.insuranceExpiry} onChange={(e) => setForm((f) => ({ ...f, insuranceExpiry: e.target.value }))} className={inputCls} />
          </InputField>
          <button onClick={handleAdd} disabled={!form.name || !form.plate || saving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all">
            {saving ? "儲存中..." : "新增車輛"}
          </button>
        </div>
      </Modal>
    </>
  );
}
