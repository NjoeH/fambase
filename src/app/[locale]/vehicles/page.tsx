"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import {
  getVehicles, Vehicle,
  getFuelRecords, addFuelRecord, FuelRecord, FuelRecordData,
  getServiceRecords, addServiceRecord, ServiceRecord, ServiceRecordData,
} from "@/lib/firestore";
import Icon from "@/components/Icon";
import VehicleCard from "@/components/vehicles/VehicleCard";
import StatCard from "@/components/vehicles/StatCard";
import FuelChart from "@/components/vehicles/FuelChart";
import Modal from "@/components/Modal";
import { uploadInvoice } from "@/lib/storage";

const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

function daysUntil(dateStr: string): number {
  if (!dateStr) return Infinity;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-xs">{label}</label>
      {children}
    </div>
  );
}

function InvoiceUpload({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-xs">上傳發票 / 收據</label>
      {file ? (
        <div className="flex items-center gap-sm p-sm bg-primary-container/30 rounded-xl">
          <Icon name="receipt_long" className="text-primary shrink-0" />
          <span className="text-sm flex-1 truncate">{file.name}</span>
          <button onClick={() => onChange(null)} className="p-xs rounded-full hover:bg-error-container transition-colors">
            <Icon name="close" className="text-error text-base" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-sm p-sm border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary hover:bg-primary-container/10 transition-colors">
          <Icon name="upload_file" className="text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">選擇圖片或 PDF</span>
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        </label>
      )}
    </div>
  );
}

const emptyFuel: FuelRecordData = { date: "", mileage: 0, amount: 0, cost: 0, notes: "", invoiceUrl: "" };
const emptyService: ServiceRecordData = { date: "", mileage: 0, type: "", cost: 0, shop: "", notes: "", invoiceUrl: "" };

const serviceTypes = ["定期保養", "輪胎更換", "煞車檢修", "引擎保養", "冷氣維修", "電池檢測", "其他"];

export default function VehiclesPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { familyId } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Speed dial
  const [dialOpen, setDialOpen] = useState(false);

  // Fuel modal
  const [showFuel, setShowFuel] = useState(false);
  const [fuelForm, setFuelForm] = useState<FuelRecordData>({ ...emptyFuel, date: todayStr() });
  const [fuelInvoice, setFuelInvoice] = useState<File | null>(null);
  const [fuelSaving, setFuelSaving] = useState(false);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);

  // Service modal
  const [showService, setShowService] = useState(false);
  const [serviceForm, setServiceForm] = useState<ServiceRecordData>({ ...emptyService, date: todayStr() });
  const [serviceInvoice, setServiceInvoice] = useState<File | null>(null);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    if (!familyId) return;
    getVehicles(familyId)
      .then((v) => {
        setVehicles(v);
        if (v.length > 0) setActiveId(v[0].id);
      })
      .finally(() => setLoading(false));
  }, [familyId]);

  // Load records when active vehicle changes
  useEffect(() => {
    if (!familyId || !activeId) return;
    getFuelRecords(familyId, activeId).then(setFuelRecords);
    getServiceRecords(familyId, activeId).then(setServiceRecords);
  }, [familyId, activeId]);

  const active = vehicles.find((v) => v.id === activeId) ?? null;
  const isElectric = active?.type === "electric";
  const insuranceDays = active ? daysUntil(active.insuranceExpiry) : Infinity;

  async function handleAddFuel() {
    if (!familyId || !activeId || !fuelForm.date) return;
    setFuelSaving(true);
    try {
      let invoiceUrl = "";
      if (fuelInvoice) {
        const tempId = `temp-${Date.now()}`;
        invoiceUrl = await uploadInvoice(familyId, `vehicles/${activeId}/fuel/${tempId}`, fuelInvoice);
      }
      const data = { ...fuelForm, invoiceUrl };
      const id = await addFuelRecord(familyId, activeId, data);
      setFuelRecords((prev) => [{ id, ...data }, ...prev]);
      setShowFuel(false);
      setFuelForm({ ...emptyFuel, date: todayStr() });
      setFuelInvoice(null);
    } finally {
      setFuelSaving(false);
    }
  }

  async function handleAddService() {
    if (!familyId || !activeId || !serviceForm.date || !serviceForm.type) return;
    setServiceSaving(true);
    try {
      let invoiceUrl = "";
      if (serviceInvoice) {
        const tempId = `temp-${Date.now()}`;
        invoiceUrl = await uploadInvoice(familyId, `vehicles/${activeId}/service/${tempId}`, serviceInvoice);
      }
      const data = { ...serviceForm, invoiceUrl };
      const id = await addServiceRecord(familyId, activeId, data);
      setServiceRecords((prev) => [{ id, ...data }, ...prev]);
      setShowService(false);
      setServiceForm({ ...emptyService, date: todayStr() });
      setServiceInvoice(null);
    } finally {
      setServiceSaving(false);
    }
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

        {/* 車庫 — 有車才顯示選擇器 */}
        {vehicles.length > 0 && (
          <section className="mb-lg">
            <h2 className="text-sm font-semibold text-on-surface-variant mb-sm">{t("vehicles.myGarage")}</h2>
            <div className="flex gap-md overflow-x-auto pb-xs" style={{ scrollbarWidth: "none" }}>
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  name={v.name}
                  plate={v.plate}
                  icon={v.type === "electric" ? "electric_car" : "directions_car"}
                  active={v.id === activeId}
                  onClick={() => setActiveId(v.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant space-y-md">
            <Icon name="directions_car" className="text-7xl opacity-20" />
            <p className="text-base font-semibold">尚未新增車輛</p>
            <button
              onClick={() => router.push(`/${locale}/settings`)}
              className="px-xl py-sm bg-primary text-on-primary rounded-2xl font-semibold text-sm active:scale-95 transition-transform flex items-center gap-sm"
            >
              <Icon name="settings" className="text-base" />
              前往設定新增車輛
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
                      <span className="text-xs font-bold uppercase">保修</span>
                    </div>
                    <h3 className="text-lg font-semibold mt-sm">
                      {serviceRecords.length > 0 ? `共 ${serviceRecords.length} 筆紀錄` : "尚無保修紀錄"}
                    </h3>
                    {serviceRecords[0] && (
                      <p className="text-xs opacity-80 mt-xs">最近：{serviceRecords[0].type} · {serviceRecords[0].date.replace(/-/g, "/")}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 圖表 + 統計 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
              <FuelChart title={isElectric ? "電耗趨勢" : "油耗趨勢"} />
              <div className="grid grid-cols-2 gap-md">
                <StatCard
                  icon={isElectric ? "ev_station" : "local_gas_station"}
                  label="加油/充電次數"
                  value={String(fuelRecords.length)}
                />
                <StatCard icon="tire_repair" label="胎壓狀態" value="正常" />
                <StatCard
                  icon="build"
                  label="保修紀錄"
                  value={String(serviceRecords.length)}
                  unit="筆"
                />
                <StatCard icon="history" label="最近保修" value={serviceRecords[0]?.date.replace(/-/g, "/") ?? "—"} />
              </div>
            </section>

            {/* 最近加油/充電紀錄 */}
            {fuelRecords.length > 0 && (
              <section className="mb-lg">
                <h2 className="text-sm font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">
                  {isElectric ? "充電紀錄" : "加油紀錄"}
                </h2>
                <div className="bg-white rounded-xl macaron-shadow overflow-hidden">
                  {fuelRecords.slice(0, 5).map((r, i, arr) => (
                    <div key={r.id} className={`flex items-center gap-md p-md ${i < arr.length - 1 ? "border-b border-surface-variant/20" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-primary-container/50 flex items-center justify-center shrink-0">
                        <Icon name={isElectric ? "bolt" : "local_gas_station"} className="text-primary text-base" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{r.date.replace(/-/g, "/")}</p>
                        <p className="text-xs text-on-surface-variant">
                          {r.amount} {isElectric ? "kWh" : "L"} · {r.mileage.toLocaleString()} km
                        </p>
                      </div>
                      <div className="flex items-center gap-sm">
                        {r.cost > 0 && <span className="text-sm font-bold text-primary">{r.cost.toLocaleString()}</span>}
                        {r.invoiceUrl && (
                          <a href={r.invoiceUrl} target="_blank" rel="noopener noreferrer" className="p-xs rounded-full hover:bg-primary-container transition-colors" title="查看發票">
                            <Icon name="receipt_long" className="text-primary text-base" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 最近保修紀錄 */}
            {serviceRecords.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-on-surface-variant mb-sm uppercase tracking-wider">保修紀錄</h2>
                <div className="bg-white rounded-xl macaron-shadow overflow-hidden">
                  {serviceRecords.slice(0, 5).map((r, i, arr) => (
                    <div key={r.id} className={`flex items-center gap-md p-md ${i < arr.length - 1 ? "border-b border-surface-variant/20" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-secondary-container/50 flex items-center justify-center shrink-0">
                        <Icon name="build" className="text-secondary text-base" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{r.type}</p>
                        <p className="text-xs text-on-surface-variant">
                          {r.date.replace(/-/g, "/")} · {r.mileage.toLocaleString()} km {r.shop ? `· ${r.shop}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-sm">
                        {r.cost > 0 && <span className="text-sm font-bold text-secondary">{r.cost.toLocaleString()}</span>}
                        {r.invoiceUrl && (
                          <a href={r.invoiceUrl} target="_blank" rel="noopener noreferrer" className="p-xs rounded-full hover:bg-secondary-container transition-colors" title="查看發票">
                            <Icon name="receipt_long" className="text-secondary text-base" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Speed Dial FAB — only when a vehicle is selected */}
      {active && (
        <div className="fixed right-container-padding bottom-8 flex flex-col items-end gap-sm z-40">
          {/* Backdrop */}
          {dialOpen && (
            <div className="fixed inset-0 -z-10" onClick={() => setDialOpen(false)} />
          )}

          {/* Sub-buttons */}
          {dialOpen && (
            <>
              <button
                onClick={() => { setDialOpen(false); setServiceForm({ ...emptyService, date: todayStr() }); setShowService(true); }}
                className="flex items-center gap-sm bg-secondary text-on-secondary px-lg py-sm rounded-2xl shadow-lg text-sm font-semibold active:scale-95 transition-transform"
              >
                <Icon name="build" className="text-base" />
                新增保修
              </button>
              <button
                onClick={() => { setDialOpen(false); setFuelForm({ ...emptyFuel, date: todayStr() }); setShowFuel(true); }}
                className="flex items-center gap-sm bg-tertiary text-on-tertiary px-lg py-sm rounded-2xl shadow-lg text-sm font-semibold active:scale-95 transition-transform"
              >
                <Icon name={isElectric ? "bolt" : "local_gas_station"} className="text-base" />
                {isElectric ? "新增充電" : "新增加油"}
              </button>
            </>
          )}

          {/* Main FAB */}
          <button
            onClick={() => setDialOpen((o) => !o)}
            className="w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-all duration-200"
          >
            <Icon name={dialOpen ? "close" : "add"} className={`transition-transform duration-200 ${dialOpen ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}

      {/* 新增加油/充電 Modal */}
      <Modal open={showFuel} onClose={() => setShowFuel(false)} title={isElectric ? "新增充電記錄" : "新增加油記錄"}>
        <div className="space-y-md">
          <InputField label="日期 *">
            <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="里程 (km)">
              <input type="number" value={fuelForm.mileage || ""} onChange={(e) => setFuelForm((f) => ({ ...f, mileage: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </InputField>
            <InputField label={isElectric ? "充電量 (kWh)" : "加油量 (L)"}>
              <input type="number" step="0.1" value={fuelForm.amount || ""} onChange={(e) => setFuelForm((f) => ({ ...f, amount: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </InputField>
          </div>
          <InputField label="費用">
            <input type="number" value={fuelForm.cost || ""} onChange={(e) => setFuelForm((f) => ({ ...f, cost: Number(e.target.value) }))} placeholder="0" className={inputCls} />
          </InputField>
          <InputField label="備註">
            <input value={fuelForm.notes} onChange={(e) => setFuelForm((f) => ({ ...f, notes: e.target.value }))} placeholder="選填" className={inputCls} />
          </InputField>
          <InvoiceUpload file={fuelInvoice} onChange={setFuelInvoice} />
          <button onClick={handleAddFuel} disabled={!fuelForm.date || fuelSaving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all">
            {fuelSaving ? "上傳中..." : "儲存記錄"}
          </button>
        </div>
      </Modal>

      {/* 新增保修 Modal */}
      <Modal open={showService} onClose={() => setShowService(false)} title="新增保修記錄">
        <div className="space-y-md">
          <InputField label="日期 *">
            <input type="date" value={serviceForm.date} onChange={(e) => setServiceForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
          </InputField>
          <InputField label="保修項目 *">
            <div className="flex flex-wrap gap-sm mb-sm">
              {serviceTypes.map((tp) => (
                <button key={tp} onClick={() => setServiceForm((f) => ({ ...f, type: tp }))}
                  className={`px-sm py-xs rounded-full text-xs font-semibold transition-colors ${serviceForm.type === tp ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                  {tp}
                </button>
              ))}
            </div>
            <input value={serviceForm.type} onChange={(e) => setServiceForm((f) => ({ ...f, type: e.target.value }))} placeholder="或直接輸入..." className={inputCls} />
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="里程 (km)">
              <input type="number" value={serviceForm.mileage || ""} onChange={(e) => setServiceForm((f) => ({ ...f, mileage: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </InputField>
            <InputField label="費用">
              <input type="number" value={serviceForm.cost || ""} onChange={(e) => setServiceForm((f) => ({ ...f, cost: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </InputField>
          </div>
          <InputField label="廠商">
            <input value={serviceForm.shop} onChange={(e) => setServiceForm((f) => ({ ...f, shop: e.target.value }))} placeholder="選填" className={inputCls} />
          </InputField>
          <InputField label="備註">
            <input value={serviceForm.notes} onChange={(e) => setServiceForm((f) => ({ ...f, notes: e.target.value }))} placeholder="選填" className={inputCls} />
          </InputField>
          <InvoiceUpload file={serviceInvoice} onChange={setServiceInvoice} />
          <button onClick={handleAddService} disabled={!serviceForm.date || !serviceForm.type || serviceSaving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all">
            {serviceSaving ? "上傳中..." : "儲存記錄"}
          </button>
        </div>
      </Modal>
    </>
  );
}
