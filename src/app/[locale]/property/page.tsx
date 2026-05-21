"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import {
  getMaintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord,
  MaintenanceRecord, MaintenanceRecordData,
  getBillCategories, BillCategory,
  getBillRecords, addBillRecord, deleteBillRecord,
  BillRecord, BillRecordData,
} from "@/lib/firestore";
import { uploadInvoice } from "@/lib/storage";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";

const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const iconOptions = [
  { value: "build",               label: "維修" },
  { value: "kitchen",             label: "廚房" },
  { value: "plumbing",            label: "水電" },
  { value: "grid_on",             label: "地板" },
  { value: "electrical_services", label: "電氣" },
  { value: "landscape",           label: "庭院" },
  { value: "roofing",             label: "屋頂" },
  { value: "chair",               label: "家具" },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
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

const emptyMaintForm: MaintenanceRecordData = {
  title: "", desc: "", cost: "", date: "", contractor: "", icon: "build", invoiceUrl: "",
};
const emptyBillForm: BillRecordData = {
  categoryId: "", categoryName: "", date: "", amount: 0, notes: "", invoiceUrl: "",
};

export default function PropertyPage() {
  const router = useRouter();
  const locale = useLocale();
  const { familyId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"maintenance" | "bills">("bills");

  // Maintenance
  const [maintRecords, setMaintRecords] = useState<MaintenanceRecord[]>([]);
  const [showMaint, setShowMaint] = useState(false);
  const [maintForm, setMaintForm] = useState<MaintenanceRecordData>({ ...emptyMaintForm, date: todayStr() });
  const [maintInvoice, setMaintInvoice] = useState<File | null>(null);
  const [maintSaving, setMaintSaving] = useState(false);

  // Bills
  const [billCategories, setBillCategories] = useState<BillCategory[]>([]);
  const [billRecords, setBillRecords] = useState<BillRecord[]>([]);
  const [showBill, setShowBill] = useState(false);
  const [billForm, setBillForm] = useState<BillRecordData>({ ...emptyBillForm, date: todayStr() });
  const [billInvoice, setBillInvoice] = useState<File | null>(null);
  const [billSaving, setBillSaving] = useState(false);

  // Speed dial
  const [dialOpen, setDialOpen] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    Promise.all([
      getMaintenanceRecords(familyId),
      getBillCategories(familyId),
      getBillRecords(familyId),
    ]).then(([maint, cats, bills]) => {
      setMaintRecords(maint);
      setBillCategories(cats);
      setBillRecords(bills);
    }).finally(() => setLoading(false));
  }, [familyId]);

  // 計算每個類別的最後一筆和下次預計日期
  function getCategoryStatus(cat: BillCategory) {
    const records = billRecords.filter((r) => r.categoryId === cat.id);
    if (records.length === 0) return { lastAmount: null, nextDue: null, daysDiff: null };
    const last = records[0]; // sorted desc
    const nextDue = addDays(last.date, cat.cycleDays);
    const daysDiff = daysUntil(nextDue);
    return { lastAmount: last.amount, nextDue, daysDiff };
  }

  async function handleAddMaint() {
    if (!familyId || !maintForm.title || !maintForm.date) return;
    setMaintSaving(true);
    try {
      let invoiceUrl = "";
      if (maintInvoice) {
        invoiceUrl = await uploadInvoice(familyId, `maintenance/temp-${Date.now()}`, maintInvoice);
      }
      const data = { ...maintForm, invoiceUrl };
      const id = await addMaintenanceRecord(familyId, data);
      setMaintRecords((prev) => [{ id, ...data }, ...prev]);
      setShowMaint(false);
      setMaintForm({ ...emptyMaintForm, date: todayStr() });
      setMaintInvoice(null);
    } finally {
      setMaintSaving(false);
    }
  }

  async function handleAddBill() {
    if (!familyId || !billForm.categoryId || !billForm.date) return;
    setBillSaving(true);
    try {
      let invoiceUrl = "";
      if (billInvoice) {
        invoiceUrl = await uploadInvoice(familyId, `bills/temp-${Date.now()}`, billInvoice);
      }
      const data = { ...billForm, invoiceUrl };
      const id = await addBillRecord(familyId, data);
      setBillRecords((prev) => [{ id, ...data }, ...prev]);
      setShowBill(false);
      setBillForm({ ...emptyBillForm, date: todayStr() });
      setBillInvoice(null);
    } finally {
      setBillSaving(false);
    }
  }

  async function handleDeleteMaint(id: string) {
    if (!familyId) return;
    await deleteMaintenanceRecord(familyId, id);
    setMaintRecords((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleDeleteBill(id: string) {
    if (!familyId) return;
    await deleteBillRecord(familyId, id);
    setBillRecords((prev) => prev.filter((r) => r.id !== id));
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
      <header className="flex items-center gap-md px-lg py-sm w-full sticky top-0 z-50 bg-surface shadow-sm">
        <button onClick={() => router.push(`/${locale}`)} className="p-xs -ml-xs rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
          <Icon name="chevron_left" className="text-primary" />
        </button>
        <h1 className="text-2xl font-bold text-primary">房屋管理</h1>
      </header>

      <main className="px-container-padding pt-md max-w-5xl mx-auto pb-24">

        {/* 帳單類別卡片 */}
        {billCategories.length > 0 && (
          <section className="mb-lg">
            <h2 className="text-sm font-semibold text-on-surface-variant mb-sm">帳單概覽</h2>
            <div className="flex gap-md overflow-x-auto pb-xs" style={{ scrollbarWidth: "none" }}>
              {billCategories.map((cat) => {
                const { lastAmount, nextDue, daysDiff } = getCategoryStatus(cat);
                const overdue = daysDiff !== null && daysDiff <= 0;
                const warn = daysDiff !== null && daysDiff <= 7 && daysDiff > 0;
                return (
                  <div
                    key={cat.id}
                    className={`shrink-0 w-40 rounded-2xl p-md flex flex-col gap-sm macaron-shadow ${
                      overdue ? "bg-error-container text-on-error-container" :
                      warn    ? "bg-tertiary-container text-on-tertiary-container" :
                                "bg-white text-on-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon name={cat.icon} className={overdue || warn ? "" : "text-primary"} />
                      {daysDiff !== null && (
                        <span className={`text-[10px] font-bold px-xs py-[2px] rounded-full ${
                          overdue ? "bg-error/20" : warn ? "bg-tertiary/20" : "bg-primary-container text-primary"
                        }`}>
                          {overdue ? "逾期" : `${daysDiff}天`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold">{cat.name}</p>
                    <p className="text-xl font-bold">
                      {lastAmount !== null ? lastAmount.toLocaleString() : "—"}
                    </p>
                    <p className="text-[10px] opacity-70">
                      {nextDue ? `下次 ${nextDue.slice(5).replace("-", "/")}` : "尚無紀錄"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab 切換 */}
        <div className="flex gap-sm mb-lg bg-surface-container-low rounded-2xl p-xs">
          {([["bills", "帳單紀錄", "receipt_long"], ["maintenance", "修繕紀錄", "home_repair_service"]] as const).map(([tab, label, icon]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-sm py-sm rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
              }`}
            >
              <Icon name={icon} className="text-base" />
              {label}
            </button>
          ))}
        </div>

        {/* 帳單紀錄 */}
        {activeTab === "bills" && (
          <>
            {billCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant space-y-md bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant">
                <Icon name="receipt_long" className="text-5xl opacity-30" />
                <p className="text-sm font-semibold">尚未設定帳單類別</p>
                <button onClick={() => router.push(`/${locale}/settings`)}
                  className="px-xl py-sm bg-primary text-on-primary rounded-2xl font-semibold text-sm active:scale-95 transition-transform flex items-center gap-sm">
                  <Icon name="settings" className="text-base" />
                  前往設定新增類別
                </button>
              </div>
            ) : billRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant space-y-md bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant">
                <Icon name="receipt_long" className="text-5xl opacity-30" />
                <p className="text-sm font-semibold">尚無帳單紀錄</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl macaron-shadow overflow-hidden">
                {billRecords.map((r, i, arr) => {
                  const cat = billCategories.find((c) => c.id === r.categoryId);
                  return (
                    <div key={r.id} className={`flex items-center gap-md p-md group ${i < arr.length - 1 ? "border-b border-surface-variant/20" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-tertiary-container/50 flex items-center justify-center shrink-0">
                        <Icon name={cat?.icon ?? "receipt_long"} className="text-tertiary text-base" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{r.categoryName}</p>
                        <p className="text-xs text-on-surface-variant">{r.date.replace(/-/g, "/")} {r.notes ? `· ${r.notes}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className="text-sm font-bold text-tertiary">{r.amount.toLocaleString()}</span>
                        {r.invoiceUrl && (
                          <a href={r.invoiceUrl} target="_blank" rel="noopener noreferrer" className="p-xs rounded-full hover:bg-tertiary-container transition-colors">
                            <Icon name="receipt_long" className="text-tertiary text-base" />
                          </a>
                        )}
                        <button onClick={() => handleDeleteBill(r.id)} className="p-xs rounded-full hover:bg-error-container transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name="delete" className="text-error text-base" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* 修繕紀錄 */}
        {activeTab === "maintenance" && (
          <>
            {maintRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant space-y-md bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant">
                <Icon name="home_repair_service" className="text-5xl opacity-30" />
                <p className="text-sm font-semibold">尚未新增修繕紀錄</p>
              </div>
            ) : (
              <div className="space-y-md">
                {maintRecords.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl macaron-shadow p-md flex gap-md items-start border border-transparent hover:border-primary-container transition-all group">
                    <div className="w-14 h-14 rounded-lg bg-primary-container/40 flex items-center justify-center shrink-0">
                      <Icon name={r.icon} className="text-primary text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-xs gap-md">
                        <h3 className="font-bold text-base text-on-surface">{r.title}</h3>
                        <div className="flex items-center gap-sm shrink-0">
                          {r.cost && <span className="text-primary font-bold text-sm">{r.cost}</span>}
                          {r.invoiceUrl && (
                            <a href={r.invoiceUrl} target="_blank" rel="noopener noreferrer" className="p-xs rounded-full hover:bg-primary-container transition-colors">
                              <Icon name="receipt_long" className="text-primary text-base" />
                            </a>
                          )}
                          <button onClick={() => handleDeleteMaint(r.id)} className="p-xs rounded-full hover:bg-error-container transition-colors opacity-0 group-hover:opacity-100">
                            <Icon name="delete" className="text-error text-base" />
                          </button>
                        </div>
                      </div>
                      {r.desc && <p className="text-on-surface-variant text-sm mb-sm line-clamp-2">{r.desc}</p>}
                      <div className="flex items-center gap-md text-xs text-outline">
                        {r.date && <span className="flex items-center gap-xs"><Icon name="calendar_today" className="text-sm" />{r.date.replace(/-/g, "/")}</span>}
                        {r.contractor && <span className="flex items-center gap-xs"><Icon name="person" className="text-sm" />{r.contractor}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Speed Dial FAB */}
      <div className="fixed right-container-padding bottom-8 flex flex-col items-end gap-sm z-40">
        {dialOpen && <div className="fixed inset-0 -z-10" onClick={() => setDialOpen(false)} />}
        {dialOpen && (
          <>
            <button
              onClick={() => { setDialOpen(false); setMaintForm({ ...emptyMaintForm, date: todayStr() }); setShowMaint(true); }}
              className="flex items-center gap-sm bg-secondary text-on-secondary px-lg py-sm rounded-2xl shadow-lg text-sm font-semibold active:scale-95 transition-transform"
            >
              <Icon name="home_repair_service" className="text-base" />
              新增修繕紀錄
            </button>
            <button
              onClick={() => { setDialOpen(false); setBillForm({ ...emptyBillForm, date: todayStr() }); setShowBill(true); }}
              className="flex items-center gap-sm bg-tertiary text-on-tertiary px-lg py-sm rounded-2xl shadow-lg text-sm font-semibold active:scale-95 transition-transform"
            >
              <Icon name="receipt_long" className="text-base" />
              新增帳單
            </button>
          </>
        )}
        <button
          onClick={() => setDialOpen((o) => !o)}
          className="w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-all duration-200"
        >
          <Icon name={dialOpen ? "close" : "add"} className={`transition-transform duration-200 ${dialOpen ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* 新增修繕 Modal */}
      <Modal open={showMaint} onClose={() => setShowMaint(false)} title="新增修繕紀錄">
        <div className="space-y-md">
          <InputField label="標題 *">
            <input value={maintForm.title} onChange={(e) => setMaintForm((f) => ({ ...f, title: e.target.value }))} placeholder="例：廚房防水工程" className={inputCls} />
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="日期 *">
              <input type="date" value={maintForm.date} onChange={(e) => setMaintForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </InputField>
            <InputField label="費用">
              <input value={maintForm.cost} onChange={(e) => setMaintForm((f) => ({ ...f, cost: e.target.value }))} placeholder="0" className={inputCls} />
            </InputField>
          </div>
          <InputField label="廠商 / 施工單位">
            <input value={maintForm.contractor} onChange={(e) => setMaintForm((f) => ({ ...f, contractor: e.target.value }))} placeholder="選填" className={inputCls} />
          </InputField>
          <InputField label="說明">
            <textarea rows={3} value={maintForm.desc} onChange={(e) => setMaintForm((f) => ({ ...f, desc: e.target.value }))} placeholder="工程內容說明..." className={inputCls + " resize-none"} />
          </InputField>
          <InputField label="圖示">
            <div className="grid grid-cols-4 gap-sm">
              {iconOptions.map((opt) => (
                <button key={opt.value} onClick={() => setMaintForm((f) => ({ ...f, icon: opt.value }))}
                  className={`flex flex-col items-center gap-xs p-sm rounded-xl text-xs transition-colors ${maintForm.icon === opt.value ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container"}`}>
                  <Icon name={opt.value} className="text-xl" />
                  {opt.label}
                </button>
              ))}
            </div>
          </InputField>
          <InvoiceUpload file={maintInvoice} onChange={setMaintInvoice} />
          <button onClick={handleAddMaint} disabled={!maintForm.title || !maintForm.date || maintSaving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-all">
            {maintSaving ? "上傳中..." : "新增紀錄"}
          </button>
        </div>
      </Modal>

      {/* 新增帳單 Modal */}
      <Modal open={showBill} onClose={() => setShowBill(false)} title="新增帳單">
        <div className="space-y-md">
          <InputField label="類別 *">
            {billCategories.length === 0 ? (
              <p className="text-sm text-on-surface-variant">請先至設定新增帳單類別</p>
            ) : (
              <div className="flex flex-wrap gap-sm">
                {billCategories.map((cat) => (
                  <button key={cat.id}
                    onClick={() => setBillForm((f) => ({ ...f, categoryId: cat.id, categoryName: cat.name }))}
                    className={`flex items-center gap-xs px-sm py-xs rounded-full text-xs font-semibold transition-colors ${billForm.categoryId === cat.id ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                    <Icon name={cat.icon} className="text-sm" />
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </InputField>
          <div className="grid grid-cols-2 gap-md">
            <InputField label="日期 *">
              <input type="date" value={billForm.date} onChange={(e) => setBillForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
            </InputField>
            <InputField label="金額">
              <input type="number" value={billForm.amount || ""} onChange={(e) => setBillForm((f) => ({ ...f, amount: Number(e.target.value) }))} placeholder="0" className={inputCls} />
            </InputField>
          </div>
          <InputField label="備註">
            <input value={billForm.notes} onChange={(e) => setBillForm((f) => ({ ...f, notes: e.target.value }))} placeholder="選填" className={inputCls} />
          </InputField>
          <InvoiceUpload file={billInvoice} onChange={setBillInvoice} />
          <button onClick={handleAddBill} disabled={!billForm.categoryId || !billForm.date || billSaving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-all">
            {billSaving ? "上傳中..." : "新增帳單"}
          </button>
        </div>
      </Modal>
    </>
  );
}
