"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNavItems, bottomNavItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/hooks/use-branding";

// Color per nav key — icon bg + glow on active
const NAV_COLORS: Record<string, { bg: string; text: string; activeBg: string; activeText: string; glow: string }> = {
  dashboard:      { bg: "bg-blue-100 dark:bg-blue-950",     text: "text-blue-600 dark:text-blue-400",     activeBg: "bg-blue-600",     activeText: "text-white", glow: "shadow-blue-500/30" },
  leads:          { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-600 dark:text-violet-400", activeBg: "bg-violet-600",   activeText: "text-white", glow: "shadow-violet-500/30" },
  customers:      { bg: "bg-cyan-100 dark:bg-cyan-950",     text: "text-cyan-600 dark:text-cyan-400",     activeBg: "bg-cyan-600",     activeText: "text-white", glow: "shadow-cyan-500/30" },
  tasks:          { bg: "bg-amber-100 dark:bg-amber-950",   text: "text-amber-600 dark:text-amber-400",   activeBg: "bg-amber-500",    activeText: "text-white", glow: "shadow-amber-500/30" },
  calendar:       { bg: "bg-rose-100 dark:bg-rose-950",     text: "text-rose-600 dark:text-rose-400",     activeBg: "bg-rose-600",     activeText: "text-white", glow: "shadow-rose-500/30" },
  products:       { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-600 dark:text-orange-400", activeBg: "bg-orange-500",   activeText: "text-white", glow: "shadow-orange-500/30" },
  quotes:         { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-600 dark:text-yellow-400", activeBg: "bg-yellow-500",   activeText: "text-white", glow: "shadow-yellow-500/30" },
  finance:        { bg: "bg-green-100 dark:bg-green-950",   text: "text-green-600 dark:text-green-400",   activeBg: "bg-green-600",    activeText: "text-white", glow: "shadow-green-500/30" },
  forms:          { bg: "bg-indigo-100 dark:bg-indigo-950", text: "text-indigo-600 dark:text-indigo-400", activeBg: "bg-indigo-600",   activeText: "text-white", glow: "shadow-indigo-500/30" },
  automations:    { bg: "bg-pink-100 dark:bg-pink-950",     text: "text-pink-600 dark:text-pink-400",     activeBg: "bg-pink-600",     activeText: "text-white", glow: "shadow-pink-500/30" },
  projects:       { bg: "bg-teal-100 dark:bg-teal-950",     text: "text-teal-600 dark:text-teal-400",     activeBg: "bg-teal-600",     activeText: "text-white", glow: "shadow-teal-500/30" },
  questionnaires: { bg: "bg-sky-100 dark:bg-sky-950",       text: "text-sky-600 dark:text-sky-400",       activeBg: "bg-sky-600",      activeText: "text-white", glow: "shadow-sky-500/30" },
  analytics:      { bg: "bg-lime-100 dark:bg-lime-950",     text: "text-lime-700 dark:text-lime-400",     activeBg: "bg-lime-600",     activeText: "text-white", glow: "shadow-lime-500/30" },
  whatsapp:       { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400", activeBg: "bg-emerald-600", activeText: "text-white", glow: "shadow-emerald-500/30" },
  // bottom
  logs:     { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400", activeBg: "bg-slate-600", activeText: "text-white", glow: "" },
  settings: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400", activeBg: "bg-slate-600", activeText: "text-white", glow: "" },
  support:  { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400", activeBg: "bg-slate-600", activeText: "text-white", glow: "" },
  feedback: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400", activeBg: "bg-slate-600", activeText: "text-white", glow: "" },
};

const DEFAULT_COLOR = { bg: "bg-slate-100", text: "text-slate-500", activeBg: "bg-primary", activeText: "text-primary-foreground", glow: "" };

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const { branding } = useBranding();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed start-0 top-0 z-40 border-e bg-sidebar text-sidebar-foreground">
      {/* Logo area */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border/60">
        {branding.logoDataUrl ? (
          <img src={branding.logoDataUrl} alt="" className="h-10 w-10 rounded-xl object-contain shadow-sm" />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-violet-500/25">
            {branding.companyName.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-sm font-bold leading-tight tracking-tight">{branding.companyName}</h1>
          <p className="text-[11px] text-muted-foreground font-medium">מערכת CRM</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        {mainNavItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);
          const Icon = item.icon;
          const color = NAV_COLORS[item.key] ?? DEFAULT_COLOR;

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? `${color.activeBg} ${color.activeText} shadow-md ${color.glow}`
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              {/* Icon badge */}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-white/20"
                    : `${color.bg} ${color.text} group-hover:scale-105`
                )}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="truncate">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-2">
        <Button className="w-full rounded-xl font-bold text-sm shadow-sm" size="default">
          <Plus className="h-4 w-4 me-2" />
          {t("newRecord")}
        </Button>

        <div className="pt-2 border-t border-sidebar-border/60 space-y-0.5">
          {bottomNavItems.map((item) => {
            const href = item.href.startsWith("/") ? `/${locale}${item.href}` : item.href;
            const isActive = item.href.startsWith("/") && pathname.startsWith(href);
            const Icon = item.icon;
            const color = NAV_COLORS[item.key] ?? DEFAULT_COLOR;
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "group flex items-center gap-3 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150",
                  isActive
                    ? `${color.activeBg} ${color.activeText}`
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                    isActive ? "bg-white/20" : `${color.bg} ${color.text}`
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
