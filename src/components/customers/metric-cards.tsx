import { useTranslations } from "next-intl";
import { Wallet, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Customer } from "@/lib/types";

interface MetricCardsProps {
  customer: Customer;
  locale: string;
  lifetimeValue: number;
  closeTimeDays: number | null;
}

export function MetricCards({ customer, locale, lifetimeValue, closeTimeDays }: MetricCardsProps) {
  const t = useTranslations("customers");
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  const cards = [
    {
      label: t("lifetimeValue"),
      value: formatCurrency(lifetimeValue, fmtLocale),
      icon: Wallet,
      className: "bg-primary text-primary-foreground",
    },
    {
      label: t("avgCloseTime"),
      value: closeTimeDays !== null
        ? t("closeTimeDays", { days: closeTimeDays })
        : "—",
      icon: Clock,
      className: "bg-secondary text-secondary-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`rounded-xl p-5 shadow-sm flex flex-col justify-between ${card.className}`}>
            <Icon className="h-8 w-8 opacity-50" />
            <div className="mt-4">
              <p className="text-xl font-black">{card.value}</p>
              <p className="text-xs font-medium opacity-80 uppercase">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
