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
    <aside className="hidden md:flex flex-col h-screen w-64 fixed start-0 top-0 z-40 border-e bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-6 flex items-center gap-3">
        {branding.logoDataUrl ? (
          <img src={branding.logoDataUrl} alt="" className="h-9 w-9 rounded-lg object-contain" />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {branding.companyName.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-sm font-bold leading-tight">{branding.companyName}</h1>
          <p className="text-xs text-muted-foreground">CRM</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {mainNavItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-2">
        <Button className="w-full" size="lg">
          <Plus className="h-4 w-4 me-2" />
          {t("newRecord")}
        </Button>

        <div className="pt-3 border-t space-y-1">
          {bottomNavItems.map((item) => {
            const href = item.href.startsWith("/") ? `/${locale}${item.href}` : item.href;
            const isActive = item.href.startsWith("/") && pathname.startsWith(href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
