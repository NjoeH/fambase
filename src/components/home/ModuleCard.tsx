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
}

export default function ModuleCard({
  icon, label, subtitle,
  bgCard, bgIcon, iconColor,
  labelColor = "text-on-surface",
  subtitleColor = "text-on-surface-variant",
  colSpan = false,
  href,
  onClick,
}: ModuleCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const handleClick = () => {
    if (href) router.push(`/${locale}${href}`);
    onClick?.();
  };
  if (colSpan) {
    return (
      <button
        onClick={handleClick}
        className={`col-span-2 ${bgCard} p-md rounded-2xl macaron-shadow flex items-center gap-md border-2 border-dashed border-error/20 active:scale-[0.98] transition-transform duration-150`}
      >
        <div className={`w-14 h-14 ${bgIcon} rounded-2xl flex items-center justify-center shrink-0`}>
          <Icon name={icon} className={`${iconColor} text-3xl`} />
        </div>
        <div className="text-left">
          <p className={`text-sm font-semibold ${labelColor}`}>{label}</p>
          <p className={`text-xs ${subtitleColor}`}>{subtitle}</p>
        </div>
        <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${bgCard} p-md rounded-2xl macaron-shadow flex flex-col gap-sm items-start text-left active:scale-95 transition-transform duration-150`}
    >
      <div className={`w-12 h-12 rounded-xl ${bgIcon} flex items-center justify-center mb-xs`}>
        <Icon name={icon} className={`${iconColor} text-2xl`} />
      </div>
      <div>
        <p className={`text-sm font-semibold ${labelColor}`}>{label}</p>
        <p className={`text-xs ${subtitleColor}`}>{subtitle}</p>
      </div>
    </button>
  );
}
