"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import {
  getVehicles, addVehicle, deleteVehicle,
  Vehicle, VehicleData,
  getServiceIntervals, addServiceInterval, deleteServiceInterval,
  ServiceInterval, ServiceIntervalData,
  getBillCategories, addBillCategory, deleteBillCategory,
  BillCategory, BillCategoryData,
} from "@/lib/firestore";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";

const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const emptyVehicleForm: VehicleData = {
  name: "", plate: "", type: "gas", fuelPct: 100, mileage: 0, insuranceExpiry: "",
};

const defaultIntervalTypes = ["定期保養", "輪胎更換", "煞車檢修", "引擎保養", "冷氣維修", "電池檢測"];

const emptyIntervalForm: ServiceIntervalData = { type: "", intervalDays: undefined, intervalMileage: undefined };

const defaultBillCategories = [
  { name: "電費",   icon: "bolt",                 cycleDays: 60  },
  { name: "水費",   icon: "water_drop",            cycleDays: 60  },
  { name: "瓦斯",   icon: "local_fire_department", cycleDays: 30  },
  { name: "管理費", icon: "apartment",             cycleDays: 30  },
  { name: "房屋保險", icon: "home_heart",          cycleDays: 365 },
  { name: "網路費", icon: "wifi",                  cycleDays: 30  },
];

const cycleOptions = [
  { label: "每月",   days: 30  },
  { label: "每兩個月", days: 60  },
  { label: "每季",   days: 90  },
  { label: "每半年", days: 180 },
  { label: "每年",   days: 365 },
];

const emptyBillCategoryForm: BillCategoryData = { name: "", icon: "receipt_long", cycleDays: 30 };

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-xs">{label}</label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { user, logout, familyId } = useAuth();
  const [lang, setLang] = useState(locale);

  // Vehicles management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<VehicleData>(emptyVehicleForm);
  const [vehicleSaving, setVehicleSaving] = useState(false);

  // Service intervals
  const [intervals, setIntervals] = useState<ServiceInterval[]>([]);
  const [showAddInterval, setShowAddInterval] = useState(false);
  const [intervalForm, setIntervalForm] = useState<ServiceIntervalData>(emptyIntervalForm);
  const [intervalSaving, setIntervalSaving] = useState(false);

  // Bill categories
  const [billCategories, setBillCategories] = useState<BillCategory[]>([]);
  const [showAddBillCat, setShowAddBillCat] = useState(false);
  const [billCatForm, setBillCatForm] = useState<BillCategoryData>(emptyBillCategoryForm);
  const [billCatSaving, setBillCatSaving] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    getVehicles(familyId)
      .then(setVehicles)
      .finally(() => setVehicleLoading(false));
    getServiceIntervals(familyId).then(setIntervals);
    getBillCategories(familyId).then(setBillCategories);
  }, [familyId]);

  async function handleAddVehicle() {
    if (!familyId || !vehicleForm.name || !vehicleForm.plate) return;
    setVehicleSaving(true);
    try {
      const id = await addVehicle(familyId, vehicleForm);
      setVehicles((prev) => [...prev, { id, ...vehicleForm }]);
      setShowAddVehicle(false);
      setVehicleForm(emptyVehicleForm);
    } finally {
      setVehicleSaving(false);
    }
  }

  async function handleDeleteVehicle(vehicleId: string) {
    if (!familyId) return;
    await deleteVehicle(familyId, vehicleId);
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  }

  async function handleAddInterval() {
    if (!familyId || !intervalForm.type) return;
    setIntervalSaving(true);
    try {
      const id = await addServiceInterval(familyId, intervalForm);
      setIntervals((prev) => [...prev, { id, ...intervalForm }]);
      setShowAddInterval(false);
      setIntervalForm(emptyIntervalForm);
    } finally {
      setIntervalSaving(false);
    }
  }

  async function handleDeleteInterval(intervalId: string) {
    if (!familyId) return;
    await deleteServiceInterval(familyId, intervalId);
    setIntervals((prev) => prev.filter((i) => i.id !== intervalId));
  }

  async function handleAddBillCategory() {
    if (!familyId || !billCatForm.name) return;
    setBillCatSaving(true);
    try {
      const id = await addBillCategory(familyId, billCatForm);
      setBillCategories((prev) => [...prev, { id, ...billCatForm }]);
      setShowAddBillCat(false);
      setBillCatForm(emptyBillCategoryForm);
    } finally {
      setBillCatSaving(false);
    }
  }

  async function handleDeleteBillCategory(categoryId: string) {
    if (!familyId) return;
    await deleteBillCategory(familyId, categoryId);
    setBillCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }

  async function handleLogout() {
    await logout();
    router.replace(`/${locale}/login`);
  }

  return (
    <>
      <header className="flex items-center gap-md px-lg py-sm sticky top-0 z-50 bg-surface shadow-sm">
        <button onClick={() => router.push(`/${locale}`)} className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
          <Icon name="chevron_left" className="text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-primary">設定</h1>
      </header>

      <main className="px-container-padding pt-md max-w-2xl mx-auto pb-24 space-y-lg">

        {/* 車輛管理 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            車輛管理
          </h2>
          <div className="bg-white rounded-xl shadow-sm macaron-shadow overflow-hidden">
            {vehicleLoading ? (
              <div className="flex justify-center py-md">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-md text-center text-sm text-on-surface-variant">尚未新增車輛</div>
            ) : (
              vehicles.map((v, i, arr) => (
                <div key={v.id} className={`flex items-center gap-md p-md ${i < arr.length - 1 ? "border-b border-surface-variant/30" : ""}`}>
                  <div className="w-10 h-10 rounded-xl bg-primary-container/50 flex items-center justify-center shrink-0">
                    <Icon name={v.type === "electric" ? "electric_car" : "directions_car"} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{v.name}</p>
                    <p className="text-xs text-on-surface-variant">{v.plate} · {v.type === "electric" ? "電動車" : "油車"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="p-xs rounded-full hover:bg-error-container transition-colors"
                  >
                    <Icon name="delete" className="text-error text-base" />
                  </button>
                </div>
              ))
            )}

            {/* 新增按鈕 */}
            <button
              onClick={() => setShowAddVehicle(true)}
              className="w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors border-t border-surface-variant/30 text-primary"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center">
                <Icon name="add" className="text-primary" />
              </div>
              <span className="text-sm font-semibold">新增車輛</span>
            </button>
          </div>
        </section>

        {/* 保養提醒設定 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            保養提醒設定
          </h2>
          <div className="bg-white rounded-xl shadow-sm macaron-shadow overflow-hidden">
            {intervals.length === 0 && !showAddInterval && (
              <div className="p-md text-center text-sm text-on-surface-variant">尚未設定保養間隔</div>
            )}
            {intervals.map((iv, i, arr) => (
              <div key={iv.id} className={`flex items-center gap-md p-md ${i < arr.length - 1 || showAddInterval ? "border-b border-surface-variant/30" : ""}`}>
                <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center shrink-0">
                  <Icon name="build" className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{iv.type}</p>
                  <p className="text-xs text-on-surface-variant">
                    {[iv.intervalDays ? `每 ${iv.intervalDays} 天` : "", iv.intervalMileage ? `每 ${iv.intervalMileage.toLocaleString()} km` : ""].filter(Boolean).join(" · ") || "未設定間隔"}
                  </p>
                </div>
                <button onClick={() => handleDeleteInterval(iv.id)} className="p-xs rounded-full hover:bg-error-container transition-colors">
                  <Icon name="delete" className="text-error text-base" />
                </button>
              </div>
            ))}

            {showAddInterval ? (
              <div className="p-md space-y-md border-t border-surface-variant/30">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">選擇或輸入保修類型</p>
                <div className="flex flex-wrap gap-sm">
                  {defaultIntervalTypes.filter((t) => !intervals.find((iv) => iv.type === t)).map((t) => (
                    <button key={t} onClick={() => setIntervalForm((f) => ({ ...f, type: t }))}
                      className={`px-sm py-xs rounded-full text-xs font-semibold transition-colors ${intervalForm.type === t ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <input value={intervalForm.type} onChange={(e) => setIntervalForm((f) => ({ ...f, type: e.target.value }))} placeholder="或自訂類型..." className={inputCls} />
                <div className="grid grid-cols-2 gap-md">
                  <InputField label="間隔天數">
                    <input type="number" value={intervalForm.intervalDays || ""} onChange={(e) => setIntervalForm((f) => ({ ...f, intervalDays: Number(e.target.value) || undefined }))} placeholder="例：180" className={inputCls} />
                  </InputField>
                  <InputField label="間隔里程 (km)">
                    <input type="number" value={intervalForm.intervalMileage || ""} onChange={(e) => setIntervalForm((f) => ({ ...f, intervalMileage: Number(e.target.value) || undefined }))} placeholder="例：5000" className={inputCls} />
                  </InputField>
                </div>
                <div className="flex gap-sm">
                  <button onClick={() => { setShowAddInterval(false); setIntervalForm(emptyIntervalForm); }} className="flex-1 py-sm border border-outline-variant rounded-xl text-sm text-on-surface-variant">取消</button>
                  <button onClick={handleAddInterval} disabled={!intervalForm.type || intervalSaving}
                    className="flex-1 py-sm bg-primary text-on-primary rounded-xl text-sm font-semibold disabled:opacity-50">
                    {intervalSaving ? "儲存中..." : "儲存"}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddInterval(true)}
                className="w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors border-t border-surface-variant/30 text-primary">
                <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center">
                  <Icon name="add" className="text-primary" />
                </div>
                <span className="text-sm font-semibold">新增保養間隔</span>
              </button>
            )}
          </div>
        </section>

        {/* 帳單類別設定 */}
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-md px-1">
            帳單類別設定
          </h2>
          <div className="bg-white rounded-xl shadow-sm macaron-shadow overflow-hidden">
            {billCategories.length === 0 && !showAddBillCat && (
              <div className="p-md text-center text-sm text-on-surface-variant">尚未設定帳單類別</div>
            )}
            {billCategories.map((cat, i, arr) => (
              <div key={cat.id} className={`flex items-center gap-md p-md ${i < arr.length - 1 || showAddBillCat ? "border-b border-surface-variant/30" : ""}`}>
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/50 flex items-center justify-center shrink-0">
                  <Icon name={cat.icon} className="text-tertiary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{cat.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {cycleOptions.find((c) => c.days === cat.cycleDays)?.label ?? `每 ${cat.cycleDays} 天`}
                  </p>
                </div>
                <button onClick={() => handleDeleteBillCategory(cat.id)} className="p-xs rounded-full hover:bg-error-container transition-colors">
                  <Icon name="delete" className="text-error text-base" />
                </button>
              </div>
            ))}

            {showAddBillCat ? (
              <div className="p-md space-y-md border-t border-surface-variant/30">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">選擇常用類別</p>
                <div className="flex flex-wrap gap-sm">
                  {defaultBillCategories.filter((d) => !billCategories.find((c) => c.name === d.name)).map((d) => (
                    <button key={d.name} onClick={() => setBillCatForm({ name: d.name, icon: d.icon, cycleDays: d.cycleDays })}
                      className={`flex items-center gap-xs px-sm py-xs rounded-full text-xs font-semibold transition-colors ${billCatForm.name === d.name ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                      <Icon name={d.icon} className="text-sm" />{d.name}
                    </button>
                  ))}
                </div>
                <InputField label="類別名稱">
                  <input value={billCatForm.name} onChange={(e) => setBillCatForm((f) => ({ ...f, name: e.target.value }))} placeholder="或自訂類別..." className={inputCls} />
                </InputField>
                <InputField label="繳費週期">
                  <div className="flex flex-wrap gap-sm">
                    {cycleOptions.map((c) => (
                      <button key={c.days} onClick={() => setBillCatForm((f) => ({ ...f, cycleDays: c.days }))}
                        className={`px-sm py-xs rounded-full text-xs font-semibold transition-colors ${billCatForm.cycleDays === c.days ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </InputField>
                <div className="flex gap-sm">
                  <button onClick={() => { setShowAddBillCat(false); setBillCatForm(emptyBillCategoryForm); }} className="flex-1 py-sm border border-outline-variant rounded-xl text-sm text-on-surface-variant">取消</button>
                  <button onClick={handleAddBillCategory} disabled={!billCatForm.name || billCatSaving}
                    className="flex-1 py-sm bg-primary text-on-primary rounded-xl text-sm font-semibold disabled:opacity-50">
                    {billCatSaving ? "儲存中..." : "儲存"}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddBillCat(true)}
                className="w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors border-t border-surface-variant/30 text-primary">
                <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center">
                  <Icon name="add" className="text-primary" />
                </div>
                <span className="text-sm font-semibold">新增帳單類別</span>
              </button>
            )}
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
                onClick={() => { setLang(l.code); router.push(`/${l.code}/settings`); }}
                className={`w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors ${i < arr.length - 1 ? "border-b border-surface-variant/30" : ""}`}
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-on-surface">{l.label}</p>
                  <p className="text-xs text-on-surface-variant">{l.sublabel}</p>
                </div>
                {lang === l.code && <Icon name="check_circle" className="text-primary" />}
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
              <div key={item.label} className={`flex items-center gap-md p-md ${i < arr.length - 1 ? "border-b border-surface-variant/30" : ""}`}>
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
                <img src={user.photoURL} alt={user.displayName ?? ""} className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <Icon name="person" className="text-primary" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">{user?.displayName ?? "使用者"}</p>
                <p className="text-xs text-on-surface-variant">{user?.email ?? ""}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors text-error">
              <Icon name="logout" className="text-error" />
              <span className="text-sm font-semibold">登出</span>
            </button>
          </div>
        </section>

      </main>

      {/* Add Vehicle Modal */}
      <Modal open={showAddVehicle} onClose={() => setShowAddVehicle(false)} title="新增車輛">
        <div className="space-y-md">
          <InputField label="車輛名稱 *">
            <input value={vehicleForm.name} onChange={(e) => setVehicleForm((f) => ({ ...f, name: e.target.value }))} placeholder="例：Tesla Model Y" className={inputCls} />
          </InputField>
          <InputField label="車牌號碼 *">
            <input value={vehicleForm.plate} onChange={(e) => setVehicleForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))} placeholder="例：ABC-1234" className={inputCls} />
          </InputField>
          <InputField label="種類">
            <div className="flex gap-sm">
              {(["gas", "electric"] as const).map((tp) => (
                <button key={tp} onClick={() => setVehicleForm((f) => ({ ...f, type: tp }))}
                  className={`flex-1 py-sm rounded-xl text-sm font-semibold transition-colors ${vehicleForm.type === tp ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                  {tp === "gas" ? "油車" : "電動車"}
                </button>
              ))}
            </div>
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="里程 (km)">
              <input type="number" value={vehicleForm.mileage || ""} onChange={(e) => setVehicleForm((f) => ({ ...f, mileage: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </InputField>
            <InputField label={vehicleForm.type === "electric" ? "電量 (%)" : "油量 (%)"}>
              <input type="number" min={0} max={100} value={vehicleForm.fuelPct || ""} onChange={(e) => setVehicleForm((f) => ({ ...f, fuelPct: Math.min(100, Number(e.target.value)) }))} placeholder="100" className={inputCls} />
            </InputField>
          </div>
          <InputField label="保險到期日">
            <input type="date" value={vehicleForm.insuranceExpiry} onChange={(e) => setVehicleForm((f) => ({ ...f, insuranceExpiry: e.target.value }))} className={inputCls} />
          </InputField>
          <button onClick={handleAddVehicle} disabled={!vehicleForm.name || !vehicleForm.plate || vehicleSaving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all">
            {vehicleSaving ? "儲存中..." : "新增車輛"}
          </button>
        </div>
      </Modal>
    </>
  );
}
