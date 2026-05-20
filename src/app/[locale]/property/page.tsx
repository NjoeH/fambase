"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import {
  getMaintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord,
  MaintenanceRecord, MaintenanceRecordData,
} from "@/lib/firestore";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";

const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const iconOptions = [
  { value: "build",               label: "維修" },
  { value: "kitchen",             label: "廚房" },
  { value: "plumbing",            label: "水電" },
  { value: "grid_on",             label: "地板" },
  { value: "electrical_services", label: "電氣" },
  { value: "landscape",          label: "庭院" },
  { value: "roofing",             label: "屋頂" },
  { value: "chair",               label: "家具" },
];

const emptyForm: MaintenanceRecordData = {
  title: "", desc: "", cost: "", date: "", contractor: "", icon: "build",
};

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-xs">{label}</label>
      {children}
    </div>
  );
}

export default function PropertyPage() {
  const router = useRouter();
  const locale = useLocale();
  const { familyId } = useAuth();

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MaintenanceRecordData>(emptyForm);

  useEffect(() => {
    if (!familyId) return;
    getMaintenanceRecords(familyId)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [familyId]);

  async function handleAdd() {
    if (!familyId || !form.title || !form.date) return;
    setSaving(true);
    try {
      const id = await addMaintenanceRecord(familyId, form);
      setRecords((prev) => [{ id, ...form }, ...prev]);
      setShowAdd(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!familyId) return;
    await deleteMaintenanceRecord(familyId, id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      <header className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface shadow-sm">
        <div className="flex items-center gap-md">
          <button onClick={() => router.push(`/${locale}`)} className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
            <Icon name="chevron_left" className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-primary">房屋管理</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="p-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
          <Icon name="add" className="text-primary" />
        </button>
      </header>

      <main className="px-container-padding pt-lg max-w-5xl mx-auto pb-24 space-y-lg">

        {/* Hero summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
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
                <span>下次繳費日期：每月 15 日</span>
              </div>
            </div>
            <div className="mt-xl flex gap-sm">
              <button className="flex-1 bg-primary text-on-primary py-sm rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity active:scale-95">立即繳費</button>
              <button className="px-md border border-outline-variant text-on-surface-variant py-sm rounded-lg font-semibold text-sm hover:bg-surface-container transition-colors active:scale-95">查看詳情</button>
            </div>
          </section>

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

        {/* Maintenance records */}
        <section className="space-y-md">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-on-surface">裝潢與修繕紀錄</h2>
            <button onClick={() => setShowAdd(true)} className="text-primary font-semibold text-sm flex items-center gap-xs hover:underline">
              <Icon name="add" className="text-base" />
              新增紀錄
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant space-y-md bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant">
              <Icon name="home_repair_service" className="text-5xl opacity-30" />
              <p className="text-sm font-semibold">尚未新增修繕紀錄</p>
              <button onClick={() => setShowAdd(true)} className="px-xl py-sm bg-primary text-on-primary rounded-2xl font-semibold text-sm active:scale-95 transition-transform">
                新增第一筆紀錄
              </button>
            </div>
          ) : (
            <div className="space-y-md">
              {records.map((r) => (
                <div key={r.id} className="bg-white rounded-xl macaron-shadow p-md flex gap-md items-start border border-transparent hover:border-primary-container transition-all group">
                  <div className="w-16 h-16 rounded-lg bg-primary-container/40 flex items-center justify-center flex-shrink-0">
                    <Icon name={r.icon} className="text-primary text-3xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-xs gap-md">
                      <h3 className="font-bold text-base text-on-surface">{r.title}</h3>
                      <div className="flex items-center gap-sm flex-shrink-0">
                        {r.cost && <span className="text-primary font-bold text-sm">{r.cost}</span>}
                        <button onClick={() => handleDelete(r.id)} className="p-xs rounded-full hover:bg-error-container transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name="delete" className="text-error text-base" />
                        </button>
                      </div>
                    </div>
                    {r.desc && <p className="text-on-surface-variant text-sm mb-sm line-clamp-2">{r.desc}</p>}
                    <div className="flex items-center gap-md text-xs text-outline">
                      {r.date && (
                        <span className="flex items-center gap-xs">
                          <Icon name="calendar_today" className="text-sm" />
                          {r.date}
                        </span>
                      )}
                      {r.contractor && (
                        <span className="flex items-center gap-xs">
                          <Icon name="person" className="text-sm" />
                          {r.contractor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <button onClick={() => setShowAdd(true)} className="fixed right-container-padding bottom-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="add" className="text-3xl" />
      </button>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="新增修繕紀錄">
        <div className="space-y-md">
          <InputField label="標題 *">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="例：廚房防水工程" className={inputCls} />
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="日期 *">
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </InputField>
            <InputField label="費用">
              <input value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} placeholder="NT$ 0" className={inputCls} />
            </InputField>
          </div>
          <InputField label="廠商 / 施工單位">
            <input value={form.contractor} onChange={(e) => setForm((f) => ({ ...f, contractor: e.target.value }))} placeholder="例：宏達防水工程" className={inputCls} />
          </InputField>
          <InputField label="說明">
            <textarea rows={3} value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} placeholder="工程內容說明..." className={inputCls + " resize-none"} />
          </InputField>
          <InputField label="圖示">
            <div className="grid grid-cols-4 gap-sm">
              {iconOptions.map((opt) => (
                <button key={opt.value} onClick={() => setForm((f) => ({ ...f, icon: opt.value }))}
                  className={`flex flex-col items-center gap-xs p-sm rounded-xl text-xs transition-colors ${form.icon === opt.value ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container"}`}>
                  <Icon name={opt.value} className="text-xl" />
                  {opt.label}
                </button>
              ))}
            </div>
          </InputField>
          <button onClick={handleAdd} disabled={!form.title || !form.date || saving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all">
            {saving ? "儲存中..." : "新增紀錄"}
          </button>
        </div>
      </Modal>
    </>
  );
}
