"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Phone, MoreVertical, Pencil, Trash2, ExternalLink, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { getInitials, formatCurrency } from "@/lib/utils";
import type { Customer } from "@/lib/types";

interface CustomersTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomersTable({ customers, onEdit, onDelete }: CustomersTableProps) {
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-[200px]">{t("contact")}</TableHead>
            <TableHead className="min-w-[120px]">{t("phone")}</TableHead>
            <TableHead className="min-w-[120px]">{t("company")}</TableHead>
            <TableHead className="min-w-[100px]">{t("industry")}</TableHead>
            <TableHead className="min-w-[110px]">{t("value")}</TableHead>
            <TableHead className="min-w-[100px]">{t("source")}</TableHead>
            <TableHead className="w-[120px]">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                {t("noCustomers")}
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => (
              <TableRow key={c.id} className="group hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-bold">
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="text-sm">{c.company}</TableCell>
                <TableCell>
                  {c.industry && (
                    <Badge variant="outline" className="text-xs">{c.industry}</Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-sm text-secondary">
                  {formatCurrency(c.lifetimeValue, fmtLocale)}
                </TableCell>
                <TableCell>
                  {c.convertedFromLeadId ? (
                    <Badge className="text-xs gap-1 bg-secondary/10 text-secondary border-secondary/20">
                      <UserCheck className="h-3 w-3" />
                      {t("sourceConverted")}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">{t("sourceDirect")}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/${locale}/customers/${c.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(c)}>
                          <Pencil className="h-4 w-4 me-2" />
                          {tc("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(c.id)}
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
