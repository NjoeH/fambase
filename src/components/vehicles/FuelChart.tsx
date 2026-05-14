"use client";

import { useState } from "react";

const mockData = {
  週: [40, 60, 35, 75, 90, 50, 25],
  月: [55, 45, 70, 60, 80, 65, 40],
};

const labels = {
  週: ["週一", "週二", "週三", "週四", "週五", "週六", "週日"],
  月: ["11/01", "11/08", "11/15", "11/22", "11/29", "12/06", "12/13"],
};

export default function FuelChart({ title = "油耗趨勢" }: { title?: string }) {
  const [range, setRange] = useState<"週" | "月">("月");
  const data = mockData[range];
  const max = Math.max(...data);

  return (
    <div className="bg-white rounded-xl shadow-sm p-lg">
      <div className="flex justify-between items-center mb-lg">
        <h3 className="text-2xl font-semibold text-on-surface">{title}</h3>
        <div className="flex gap-xs">
          {(["週", "月"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-sm py-xs text-xs rounded-full font-semibold transition-colors ${
                range === r
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="h-48 w-full flex items-end gap-sm px-xs pb-sm border-b border-outline-variant">
        {data.map((val, i) => {
          const isLast = i === data.length - 1;
          const heightPct = (val / max) * 100;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-lg transition-all duration-300 ${
                isLast
                  ? "bg-primary text-on-primary flex flex-col items-center justify-start pt-xs"
                  : "bg-primary-container"
              }`}
              style={{
                height: `${heightPct}%`,
                opacity: isLast ? 1 : 0.4 + (val / max) * 0.5,
              }}
            >
              {isLast && <span className="text-[10px] font-bold">當前</span>}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-sm text-xs text-on-surface-variant font-medium">
        <span>{labels[range][0]}</span>
        <span>{labels[range][Math.floor(labels[range].length / 2)]}</span>
        <span>{labels[range][labels[range].length - 1]}</span>
      </div>
    </div>
  );
}
