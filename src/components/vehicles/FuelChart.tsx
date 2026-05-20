"use client";

import { FuelRecord } from "@/lib/firestore";

interface Props {
  records: FuelRecord[];
  isElectric: boolean;
  title?: string;
}

function calcEfficiencies(records: FuelRecord[]) {
  const sorted = [...records].sort((a, b) => a.mileage - b.mileage);
  return sorted.slice(1).map((r, i) => {
    const prev = sorted[i];
    const dist = r.mileage - prev.mileage;
    if (dist <= 0 || r.amount <= 0) return null;
    return { date: r.date, value: parseFloat(((r.amount / dist) * 100).toFixed(1)) };
  }).filter((x): x is { date: string; value: number } => x !== null);
}

export default function FuelChart({ records, isElectric, title }: Props) {
  const data = calcEfficiencies(records).slice(-8);
  const unit = isElectric ? "kWh/100km" : "L/100km";
  const avg = data.length ? (data.reduce((s, d) => s + d.value, 0) / data.length).toFixed(1) : null;
  const chartTitle = title ?? (isElectric ? "電耗趨勢" : "油耗趨勢");

  if (data.length < 2) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-lg flex flex-col items-center justify-center min-h-[240px] text-center gap-sm">
        <h3 className="text-2xl font-semibold text-on-surface">{chartTitle}</h3>
        <p className="text-xs text-on-surface-variant">需要至少 2 筆紀錄才能計算油耗</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-xl shadow-sm p-lg">
      <div className="flex justify-between items-start mb-md">
        <div>
          <h3 className="text-2xl font-semibold text-on-surface">{chartTitle}</h3>
          {avg && <p className="text-xs text-on-surface-variant mt-xs">平均 {avg} {unit}</p>}
        </div>
        <span className="text-xs text-on-surface-variant bg-surface-container-low px-sm py-xs rounded-full">{unit}</span>
      </div>
      <div className="h-48 w-full flex items-end gap-sm px-xs pb-sm border-b border-outline-variant">
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const heightPct = Math.max((d.value / max) * 100, 4);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-xs">
              {isLast && (
                <span className="text-[9px] font-bold text-primary leading-none">{d.value}</span>
              )}
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${isLast ? "bg-primary" : "bg-primary-container"}`}
                style={{ height: `${heightPct}%`, opacity: isLast ? 1 : 0.4 + (d.value / max) * 0.5 }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-sm text-xs text-on-surface-variant font-medium">
        <span>{data[0].date.slice(5).replace("-", "/")}</span>
        <span>{data[data.length - 1].date.slice(5).replace("-", "/")}</span>
      </div>
    </div>
  );
}
