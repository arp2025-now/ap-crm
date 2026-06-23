"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNavItems, bottomNavItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/hooks/use-branding";

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const { branding } = useBranding();

  return (
    <aside className="hidden md:flex flex-col h-screen w-56 fixed start-0 top-0 z-40 border-e border-border/50 bg-background text-foreground">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5 border-b border-border/50">
        {branding.logoDataUrl ? (
          <img src={branding.logoDataUrl} alt="" className="h-7 w-7 rounded-lg object-contain" />
        ) : (
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center text-background font-bold text-xs">
            {branding.companyName.charAt(0)}
          </div>
        )}
        <span className="text-sm font-semibold truncate">{branding.companyName}</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 pt-3 space-y-px overflow-y-auto">
        {mainNavItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
              <span className="truncate">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-1">
        <Button variant="outline" className="w-full justify-start gap-2.5 text-sm font-medium h-9" size="sm">
          <Plus className="h-4 w-4" />
          {t("newRecord")}
        </Button>

        <div className="pt-1 border-t border-border/50 space-y-px">
          {bottomNavItems.map((item) => {
            const href = item.href.startsWith("/") ? `/${locale}${item.href}` : item.href;
            const isActive = item.href.startsWith("/") && pathname.startsWith(href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
