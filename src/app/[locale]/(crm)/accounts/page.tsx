import { useTranslations, useLocale } from "next-intl";
import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getInitials, formatCurrency, formatDate } from "@/lib/utils";
import { mockAccounts } from "@/lib/mock-data";

export default function AccountsPage() {
  const t = useTranslations("accounts");
  const locale = useLocale();

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
            <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-blue-500/20 border-b-2 border-blue-200 dark:border-blue-800">
              <TableHead className="font-bold text-blue-800 dark:text-blue-300">{t("title")}</TableHead>
              <TableHead className="font-bold text-blue-800 dark:text-blue-300">{t("industry")}</TableHead>
              <TableHead className="font-bold text-blue-800 dark:text-blue-300">{t("contacts")}</TableHead>
              <TableHead className="font-bold text-blue-800 dark:text-blue-300">{t("totalValue")}</TableHead>
              <TableHead className="font-bold text-blue-800 dark:text-blue-300">{t("lastActivity")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAccounts.map((account) => (
              <TableRow key={account.id} className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-500/15 text-blue-600 text-xs font-bold">
                        {getInitials(account.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{account.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-semibold">{account.industry}</Badge>
                </TableCell>
                <TableCell>{account.contactCount}</TableCell>
                <TableCell>
                  <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatCurrency(account.totalValue, locale === "he" ? "he-IL" : "en-US")}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(account.lastActivityAt, locale === "he" ? "he-IL" : "en-US")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
