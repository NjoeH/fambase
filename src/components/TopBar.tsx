"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Icon from "./Icon";

interface TopBarProps {
  familyName: string;
  userAvatar?: string;
}

export default function TopBar({ familyName, userAvatar }: TopBarProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-container-padding h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-md">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
            <Icon name="menu" className="text-on-surface-variant" />
          </button>
          {userAvatar && (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
              <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-primary">{familyName}</h1>
        </div>
        <div className="flex items-center gap-sm">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
            <Icon name="notifications" className="text-on-surface-variant" />
          </button>
          <button
            onClick={() => router.push(`/${locale}/settings`)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
          >
            <Icon name="settings" className="text-on-surface-variant" />
          </button>
        </div>
      </div>
    </header>
  );
}
