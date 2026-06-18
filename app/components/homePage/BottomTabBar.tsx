"use client";

import type { LucideIcon } from "lucide-react";

export interface AppTabItem {
  id: string;
  label: string;
  Icon: LucideIcon;
}

interface BottomTabBarProps {
  tabs: AppTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "bottom" | "rail";
}

export default function BottomTabBar({
  tabs,
  activeTab,
  onChange,
  variant = "bottom",
}: BottomTabBarProps) {
  if (variant === "rail") {
    return (
      <nav className="rounded-3xl border border-border-gold/20 bg-background/45 p-2 shadow-xl shadow-black/20">
        <div className="space-y-1">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-black transition ${
                  isActive
                    ? "bg-gold text-background"
                    : "text-gold-dim hover:bg-parchment/60 hover:text-gold"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-border-gold/25 bg-background/95 p-1.5 shadow-2xl shadow-black/55 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-black transition ${
                isActive
                  ? "bg-gold text-background"
                  : "text-gold-dim hover:bg-parchment/60 hover:text-gold"
              }`}
            >
              <Icon size={19} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
