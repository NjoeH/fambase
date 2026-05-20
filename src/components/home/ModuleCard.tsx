"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Icon from "../Icon";

interface ModuleCardProps {
  icon: string;
  label: string;
  subtitle: string;
  bgCard: string;
  bgIcon: string;
  iconColor: string;
  labelColor?: string;
  subtitleColor?: string;
  colSpan?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ModuleCard({
  icon, label, subtitle,
  bgCard, bgIcon, iconColor,
  labelColor = "text-on-surface",
  subtitleColor = "text-on-surface-variant",
  colSpan = false,
  href,
  onClick,
  disabled = false,
}: ModuleCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const handleClick = () => {
    if (disabled) return;
    if (href) router.push(`/${locale}${href}`);
    onClick?.();
  };

  const disabledClasses = disabled
    ? "opacity-40 cursor-not-allowed"
    : "active:scale-[0.98]";

  if (colSpan) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`col-span-2 ${bgCard} p-md rounded-2xl macaron-shadow flex items-center gap-md border-2 border-dashed border-error/20 transition-transform duration-150 ${disabledClasses}`}
      >
        <div className={`w-14 h-14 ${disabled ? "bg-surface-container" : bgIcon} rounded-2xl flex items-center justify-center shrink-0`}>
          <Icon name={icon} className={`${disabled ? "text-on-surface-variant" : iconColor} text-3xl`} />
        </div>
        <div className="text-left">
          <p className={`text-sm font-semibold ${disabled ? "text-on-surface-variant" : labelColor}`}>{label}</p>
          <p className={`text-xs ${subtitleColor}`}>{subtitle}</p>
        </div>
        {disabled
          ? <span className="ml-auto text-xs text-on-surface-variant bg-surface-container px-sm py-xs rounded-full">即將推出</span>
          : <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${disabled ? "bg-surface-container-low" : bgCard} p-md rounded-2xl macaron-shadow flex flex-col gap-sm items-start text-left transition-transform duration-150 ${disabled ? "" : "active:scale-95"} ${disabledClasses}`}
    >
      <div className={`w-12 h-12 rounded-xl ${disabled ? "bg-surface-container" : bgIcon} flex items-center justify-center mb-xs`}>
        <Icon name={icon} className={`${disabled ? "text-on-surface-variant" : iconColor} text-2xl`} />
      </div>
      <div>
        <p className={`text-sm font-semibold ${disabled ? "text-on-surface-variant" : labelColor}`}>{label}</p>
        <p className={`text-xs ${subtitleColor}`}>{subtitle}</p>
      </div>
      {disabled && (
        <span className="text-[10px] text-on-surface-variant bg-surface-container px-xs py-[2px] rounded-full">即將推出</span>
      )}
    </button>
  );
}
