"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard, Users, UserCheck, CheckSquare, MoreHorizontal, X,
  CalendarDays, Package, FileText, Wallet, ClipboardList, Zap, BarChart3,
  MessageCircle, ScrollText, Settings, HelpCircle, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "leads", href: "/leads", icon: Users },
  { key: "customers", href: "/customers", icon: UserCheck },
  { key: "tasks", href: "/tasks", icon: CheckSquare },
];

const moreItems = [
  { key: "calendar", href: "/calendar", icon: CalendarDays },
  { key: "quotes", href: "/quotes", icon: FileText },
  { key: "products", href: "/products", icon: Package },
  { key: "finance", href: "/finance", icon: Wallet },
  { key: "forms", href: "/forms", icon: ClipboardList },
  { key: "automations", href: "/automations", icon: Zap },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "whatsapp", href: "/whatsapp", icon: MessageCircle },
  { key: "logs", href: "/logs", icon: ScrollText },
  { key: "settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMoreActive = moreItems.some((item) =>
    pathname.startsWith(`/${locale}${item.href}`)
  );

  return (
    <>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          "md:hidden fixed bottom-16 start-0 end-0 z-50 bg-background border-t rounded-t-2xl shadow-xl transition-transform duration-300",
          drawerOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-sm font-semibold text-muted-foreground">תפריט</span>
          <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1 px-3 pb-6">
          {moreItems.map((item) => {
            const href = `/${locale}${item.href}`;
            const isActive = pathname.startsWith(href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 start-0 end-0 z-50 flex items-center justify-around border-t bg-background py-2">
        {primaryItems.map((item) => {
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
              <span className="text-[10px] font-semibold">{t(item.key)}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-1",
            isMoreActive || drawerOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-semibold">עוד</span>
        </button>
      </nav>
    </>
  );
}
