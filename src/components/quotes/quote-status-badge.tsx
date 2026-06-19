"use client";

import { useTranslations } from "next-intl";
import { FileEdit, Send, CheckCircle2, Clock } from "lucide-react";
import type { QuoteStatus } from "@/lib/types";

const statusConfig: Record<QuoteStatus, { bg: string; text: string; border: string; icon: typeof FileEdit }> = {
  draft:   { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700", icon: FileEdit },
  sent:    { bg: "bg-sky-100 dark:bg-sky-900/40", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-700", icon: Send },
  signed:  { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-700", icon: CheckCircle2 },
  expired: { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-700", icon: Clock },
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const t = useTranslations("quotes");
  const config = statusConfig[status];
  const Icon = config.icon;

  const labelMap: Record<QuoteStatus, string> = {
    draft: t("statusDraft"),
    sent: t("statusSent"),
    signed: t("statusSigned"),
    expired: t("statusExpired"),
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="h-3 w-3" />
      {labelMap[status]}
    </span>
  );
}
