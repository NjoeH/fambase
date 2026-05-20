"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/AuthContext";
import { getPets, addPet, deletePet, Pet, PetData } from "@/lib/firestore";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";

const inputCls = "w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const emptyForm: PetData = {
  name: "", breed: "", birthday: "", gender: "male", neutered: false, chipNo: "",
};

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-xs">{label}</label>
      {children}
    </div>
  );
}

export default function PetsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { familyId } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PetData>(emptyForm);

  useEffect(() => {
    if (!familyId) return;
    getPets(familyId)
      .then((p) => {
        setPets(p);
        if (p.length > 0) setActiveId(p[0].id);
      })
      .finally(() => setLoading(false));
  }, [familyId]);

  const active = pets.find((p) => p.id === activeId) ?? null;

  async function handleAdd() {
    if (!familyId || !form.name || !form.breed) return;
    setSaving(true);
    try {
      const id = await addPet(familyId, form);
      const newPet: Pet = { id, ...form };
      setPets((prev) => [...prev, newPet]);
      setActiveId(id);
      setShowAdd(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(petId: string) {
    if (!familyId) return;
    await deletePet(familyId, petId);
    setPets((prev) => {
      const next = prev.filter((p) => p.id !== petId);
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
          <h1 className="text-2xl font-bold text-primary">寵物管理</h1>
        </div>
      </header>

      <main className="px-container-padding pt-lg max-w-5xl mx-auto pb-24 space-y-lg">

        {/* Pet selector */}
        {pets.length > 0 && (
          <div className="flex gap-sm overflow-x-auto pb-xs" style={{ scrollbarWidth: "none" }}>
            {pets.map((p) => (
              <div key={p.id} className="relative group flex-shrink-0">
                <button
                  onClick={() => setActiveId(p.id)}
                  className={`px-lg py-sm rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${p.id === activeId ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container"}`}
                >
                  {p.name}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white rounded-full items-center justify-center hidden group-hover:flex text-xs z-10"
                >
                  <Icon name="close" className="text-[12px]" />
                </button>
              </div>
            ))}
            <button onClick={() => setShowAdd(true)} className="flex-shrink-0 flex items-center gap-xs px-md py-sm rounded-full border border-dashed border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-colors text-sm">
              <Icon name="add" className="text-base" />
              新增
            </button>
          </div>
        )}

        {/* Empty state */}
        {pets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant space-y-md">
            <Icon name="pets" className="text-7xl opacity-20" />
            <p className="text-base font-semibold">尚未新增寵物</p>
            <button onClick={() => setShowAdd(true)} className="px-xl py-sm bg-primary text-on-primary rounded-2xl font-semibold text-sm active:scale-95 transition-transform">
              新增第一隻寵物
            </button>
          </div>
        ) : active && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">

            {/* Pet profile card */}
            <section className="md:col-span-8 bg-white rounded-xl macaron-shadow overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/2 h-56 md:h-auto bg-primary-container flex items-center justify-center">
                <Icon name="pets" className="text-primary text-[96px]" />
              </div>
              <div className="p-lg md:w-1/2 flex flex-col justify-center space-y-md">
                <div className="space-y-xs">
                  <span className="text-xs font-semibold bg-primary-container text-on-primary-container px-sm py-xs rounded-full">
                    {active.breed}
                  </span>
                  <h2 className="text-3xl font-bold text-primary mt-xs">{active.name}</h2>
                </div>
                <div className="space-y-sm">
                  {active.chipNo && (
                    <div className="flex items-center gap-sm text-on-surface-variant">
                      <Icon name="fingerprint" className="text-primary" />
                      <span className="text-sm">晶片號碼: {active.chipNo}</span>
                    </div>
                  )}
                  {active.birthday && (
                    <div className="flex items-center gap-sm text-on-surface-variant">
                      <Icon name="cake" className="text-primary" />
                      <span className="text-sm">生日: {active.birthday.replace(/-/g, "年").replace(/-/, "月") + "日"}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-sm text-on-surface-variant">
                    <Icon name={active.gender === "male" ? "male" : "female"} className="text-primary" />
                    <span className="text-sm">
                      性別: {active.gender === "male" ? "公" : "母"}{active.neutered ? " ・ 已結紮" : ""}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(active.id)} className="w-full py-sm border border-error text-error rounded-xl font-semibold text-sm hover:bg-error-container/30 transition-colors active:scale-95">
                  刪除此寵物
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
                  <p className="text-xs font-semibold text-on-tertiary-container">提醒</p>
                  <p className="text-sm text-on-tertiary-container mt-xs">健康紀錄功能即將推出</p>
                </div>
                <div className="space-y-xs">
                  <p className="text-xs font-semibold text-on-surface-variant">疫苗紀錄</p>
                  <p className="text-sm text-on-surface-variant/60 italic">疫苗管理功能即將推出</p>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      <button onClick={() => setShowAdd(true)} className="fixed right-container-padding bottom-8 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform">
        <Icon name="add" />
      </button>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="新增寵物">
        <div className="space-y-md">
          <InputField label="名字 *">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="例：Mochi" className={inputCls} />
          </InputField>
          <InputField label="品種 *">
            <input value={form.breed} onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))} placeholder="例：黃金獵犬" className={inputCls} />
          </InputField>
          <InputField label="性別">
            <div className="flex gap-sm">
              {(["male", "female"] as const).map((g) => (
                <button key={g} onClick={() => setForm((f) => ({ ...f, gender: g }))}
                  className={`flex-1 py-sm rounded-xl text-sm font-semibold transition-colors ${form.gender === g ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                  {g === "male" ? "公" : "母"}
                </button>
              ))}
            </div>
          </InputField>
          <InputField label="已結紮">
            <button onClick={() => setForm((f) => ({ ...f, neutered: !f.neutered }))}
              className={`w-full py-sm rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-sm ${form.neutered ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
              <Icon name={form.neutered ? "check_circle" : "radio_button_unchecked"} />
              {form.neutered ? "已結紮" : "未結紮"}
            </button>
          </InputField>
          <InputField label="生日">
            <input type="date" value={form.birthday} onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))} className={inputCls} />
          </InputField>
          <InputField label="晶片號碼">
            <input value={form.chipNo} onChange={(e) => setForm((f) => ({ ...f, chipNo: e.target.value }))} placeholder="選填" className={inputCls} />
          </InputField>
          <button onClick={handleAdd} disabled={!form.name || !form.breed || saving}
            className="w-full py-md bg-primary text-on-primary rounded-2xl font-semibold text-base disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all">
            {saving ? "儲存中..." : "新增寵物"}
          </button>
        </div>
      </Modal>
    </>
  );
}
