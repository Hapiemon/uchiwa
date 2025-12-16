"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Calendar, MessageCircle, Heart } from "lucide-react";

export function TabNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/diary", icon: BookText, label: "日記", key: "diary" },
    {
      href: "/anniversaries",
      icon: Calendar,
      label: "記念日",
      key: "anniversaries",
    },
    { href: "/chat", icon: MessageCircle, label: "チャット", key: "chat" },
    { href: "/memories", icon: Heart, label: "思い出", key: "memories" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto w-full flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition ${
                isActive
                  ? "text-pastel-pink border-b-2 border-pastel-pink"
                  : "text-gray-500 hover:text-pastel-pink"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
