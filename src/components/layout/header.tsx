"use client";

import { Search, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LocaleToggle } from "@/components/shared/locale-toggle";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border/50 bg-background px-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-full max-w-xs">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            className="ps-8 h-8 text-sm rounded-md bg-muted border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <LocaleToggle />
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 end-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <Avatar className="h-7 w-7 ms-1">
          <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
            ע
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
