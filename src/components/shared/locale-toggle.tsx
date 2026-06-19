"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LocaleToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === "he" ? "en" : "he";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLocale} title={locale === "he" ? "Switch to English" : "עברית"}>
      <Languages className="h-5 w-5" />
      <span className="sr-only">{locale === "he" ? "EN" : "HE"}</span>
    </Button>
  );
}
