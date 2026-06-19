"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { QuoteStatusBadge } from "./quote-status-badge";
import { getInitials, formatCurrency } from "@/lib/utils";
import type { Quote } from "@/lib/types";

interface QuotesTableProps {
  quotes: Quote[];
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
}

export function QuotesTable({ quotes, onEdit, onDelete }: QuotesTableProps) {
  const t = useTranslations("quotes");
  const tc = useTranslations("common");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-[100px]">{t("quoteNumber")}</TableHead>
            <TableHead className="min-w-[180px]">{t("customer")}</TableHead>
            <TableHead className="min-w-[100px]">{t("status")}</TableHead>
            <TableHead className="min-w-[110px]">{t("total")}</TableHead>
            <TableHead className="min-w-[110px]">{t("validUntil")}</TableHead>
            <TableHead className="min-w-[110px]">{t("createdAt")}</TableHead>
            <TableHead className="w-[100px]">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                {t("noQuotes")}
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((q) => (
              <TableRow key={q.id} className="group hover:bg-muted/30">
                <TableCell>
                  <Link
                    href={`/${locale}/quotes/${q.id}`}
                    className="font-mono text-sm font-semibold text-primary hover:underline"
                  >
                    {q.quoteNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {getInitials(q.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm">{q.customerName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <QuoteStatusBadge status={q.status} />
                </TableCell>
                <TableCell className="font-bold text-sm text-secondary">
                  {formatCurrency(q.total, fmtLocale)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {q.validUntil ? new Date(q.validUntil).toLocaleDateString(fmtLocale) : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(q.createdAt).toLocaleDateString(fmtLocale)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/${locale}/quotes/${q.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(q)}>
                          <Pencil className="h-4 w-4 me-2" />
                          {tc("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(q.id)}
                        >
                          <Trash2 className="h-4 w-4 me-2" />
                          {tc("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
