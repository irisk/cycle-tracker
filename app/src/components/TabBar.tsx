"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, Calendar } from "lucide-react";

const tabs = [
  { href: "/", label: "HOME", icon: Home },
  { href: "/log", label: "LOG", icon: PenLine },
  { href: "/history", label: "HISTORY", icon: Calendar },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="w-full px-[21px] pt-2 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="flex h-[56px] items-center rounded-[36px] border border-border-subtle bg-bg-card p-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[26px] h-full transition-colors ${
                isActive
                  ? "bg-green text-white"
                  : "text-text-inactive hover:text-text-secondary"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span
                className={`text-[10px] tracking-[0.5px] ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
