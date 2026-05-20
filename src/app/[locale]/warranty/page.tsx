"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import { getWarranties, addWarranty, deleteWarranty, Warranty, WarrantyData } from "@/lib/firestore";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";

const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

type WarrantyStatus = "active" | "expiring" | "expired";

const statusConfig: Record<WarrantyStatus, { label: string; bg: string; text: string }> = {
  active:   { label: "保固中",   bg: "bg-primary-container",         text: "text-on-primary-container" },
  expiring: { label: "即將到期", bg: "bg-tertiary-container",        text: "text-on-tertiary-container" },
  expired:  { label: "已過保",   bg: "bg-surface-container-highest", text: "text-on-surface-variant" },
};

const categoryIcons: Record<string, string> = {
  appliance: "kitchen",
  electronics: "laptop_mac",
  other: "verified_user",
};

const categories = [
  { key: "all",         label: "全部" },
  { key: "appliance",   label: "家電" },
  { key: "electronics", label: "3C" },
  { key: "other",       label: "其他" },
];

function getStatus(expiryDate: string): WarrantyStatus {
  if (!expiryDate) return "active";
  const ms = new Date(expiryDate).getTime() - Date.now();
  if (ms < 0) return "expired";
  if (ms < 30 * 86400000) return "expiring";
  return "active";
}

const emptyForm: WarrantyData = {
  name: "", serial: "", purchaseDate: "", expiryDate: "", category: "appliance",
};

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-xs">{label}</label>
      {children}
    </div>
  );
}

export default function WarrantyPage() {
  const router = useRouter();
  const locale = useLocale();
  const { familyId } = useAuth();

  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<WarrantyData>(emptyForm);

  useEffect(() => {
    if (!familyId) return;
    getWarranties(familyId)
      .then(setWarranties)
      .finally(() => setLoading(false));
  }, [familyId]);

  const filtered = activeCategory === "all"
    ? warranties
    : warranties.filter((w) => w.category === activeCategory);

  async function handleAdd() {
    if (!familyId || !form.name || !form.purchaseDate || !form.expiryDate) return;
    setSaving(true);
    try {
      const id = await addWarranty(familyId, form);
      setWarranties((prev) => [{ id, ...form }, ...prev]);
      setShowAdd(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!familyId) return;
    await deleteWarranty(familyId, id);
    setWarranties((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <>
      <header className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface shadow-sm">
        <div className="flex items-center gap-md">
          <button onClick={() => router.push(`/${locale}`)} className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
            <Icon name="chevron_left" className="text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-primary">保固記錄</h1>
        </div>
      </header>

      <main className="px-container-padding pt-lg max-w-5xl mx-auto pb-24">

        {/* Category tabs */}
        <div className="flex gap-sm overflow-x-auto pb-xs mb-lg" style={{ scrollbarWidth: "none" }}>
          {categories.map((c) => (
            <button key={c.key} onClick={() => setActiveCategory(c.key)}
              className={`px-lg py-sm rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${activeCategory === c.key ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container"}`}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filtered.map((w) => {
              const status = getStatus(w.expiryDate);
              const cfg = statusConfig[status];
              const icon = categoryIcons[w.category] ?? "verified_user";
              return (
                <div key={w.id} className={`bg-surface p-lg rounded-xl macaron-shadow flex flex-col gap-md group ${status === "expired" ? "opacity-70" : ""}`}>
                  <div className="flex justify-between items-start">
                    <div className="p-xs bg-primary-container/60 rounded-lg">
                      <Icon name={icon} className="text-on-primary-container" />
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className={`px-md py-1 rounded-full ${cfg.bg} ${cfg.text} text-xs font-semibold`}>{cfg.label}</span>
                      <button onClick={() => handleDelete(w.id)} className="p-xs rounded-full hover:bg-error-container transition-colors opacity-0 group-hover:opacity-100">
                        <Icon name="delete" className="text-error text-base" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-xs">{w.name}</h3>
                    {w.serial && <p className="text-on-surface-variant text-xs">序號：{w.serial}</p>}
                  </div>
                  <div className="space-y-sm py-md border-y border-surface-container">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">購買日期</span>
                      <span className="font-semibold">{w.purchaseDate.replace(/-/g, "/")}</span>
                    </div>
                    <div className={`flex justify-between text-sm ${status === "expiring" ? "text-error" : ""}`}>
                      <span className={status !== "expiring" ? "text-on-surface-variant" : ""}>保固到期</span>
                      <span className="font-semibold">{w.expiryDate.replace(/-/g, "/")}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add placeholder */}
            <div
              onClick={() => setShowAdd(true)}
              className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-xl text-on-surface-variant hover:border-primary hover:text-primary transition-all cursor-pointer group min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-md group-hover:bg-primary-container transition-colors">
                <Icon name="add_circle" className="text-3xl" />
              </div>
              <p className="text-sm font-semibold">新增保固設備</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && warranties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant space-y-md -mt-lg">
            <Icon name="verified_user" className="text-7xl opacity-20" />
            <p className="text-base font-semibold">尚未新增保固記錄</p>
            <button onClick={() => setShowAdd(true)} className="px-xl py-sm bg-primary text-on-primary rounded-2xl font-semibold text-sm active:scale-95 transition-transform">
              新增第一筆保固
            </button>
          </div>
        )}
      </main>

      <button onClick={() => setShowAdd(true)} className="fixed right-container-padding bottom-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="add" />
      </button>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="新增保固記錄">
        <div className="space-y-md">
          <InputField label="設備名稱 *">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="例：LG 洗衣機" className={inputCls} />
          </InputField>
          <InputField label="分類">
            <div className="flex gap-sm">
              {(["appliance", "electronics", "other"] as const).map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, category: c }))}
                  className={`flex-1 py-sm rounded-xl text-xs font-semibold transition-colors ${form.category === c ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                  {c === "appliance" ? "家電" : c === "electronics" ? "3C" : "其他"}
                </button>
              ))}
            </div>
          </InputField>
          <InputField label="序號">
            <input value={form.serial} onChange={(e) => setForm((f) => ({ ...f, serial: e.target.value }))} placeholder="選填" className={inputCls} />
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="購買日期 *">
              <input type="date" value={form.purchaseDate} onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))} className={inputCls} />
            </InputField>
            <InputField label="保固到期 *">
              <input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} className={inputCls} />
            </InputField>
          </div>
          <button onClick={handleAdd} disabled={!form.name || !form.purchaseDate || !form.expiryDate || saving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all">
            {saving ? "儲存中..." : "新增保固"}
          </button>
        </div>
      </Modal>
    </>
  );
}
