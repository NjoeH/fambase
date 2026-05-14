"use client";

import Icon from "../Icon";

interface VehicleCardProps {
  name: string;
  plate: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

export default function VehicleCard({ name, plate, icon, active, onClick }: VehicleCardProps) {
  if (active) {
    return (
      <div
        onClick={onClick}
        className="flex-shrink-0 w-64 p-md rounded-xl bg-primary-container text-on-primary-container shadow-sm border-2 border-primary transition-transform active:scale-95 duration-200 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-xs">
          <Icon name={icon} className="[font-variation-settings:'FILL'_1]" />
          <span className="text-xs bg-primary text-on-primary px-sm py-xs rounded-full font-semibold">使用中</span>
        </div>
        <div className="text-2xl font-semibold">{name}</div>
        <div className="text-xs opacity-80 uppercase tracking-wider">{plate}</div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-64 p-md rounded-xl bg-white text-on-surface-variant shadow-sm border border-outline-variant hover:bg-surface-container transition-colors active:scale-95 duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-xs">
        <Icon name={icon} />
      </div>
      <div className="text-2xl font-semibold text-on-surface">{name}</div>
      <div className="text-xs opacity-60 uppercase tracking-wider">{plate}</div>
    </div>
  );
}
