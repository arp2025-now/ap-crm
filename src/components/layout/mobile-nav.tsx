"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-react";

const mobileItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "leads", href: "/leads", icon: Users },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <nav className="md:hidden fixed bottom-0 start-0 end-0 z-50 flex items-center justify-around border-t bg-background py-2">
      {mobileItems.map((item) => {
        const href = `/${locale}${item.href}`;
        const isActive = pathname.startsWith(href);
        const Icon = item.icon;

        return (
          <Link
            key={item.key}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">
              {t(item.key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
