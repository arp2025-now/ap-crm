"use client";

import { useTranslations, useLocale } from "next-intl";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-[200px]">{t("name")}</TableHead>
            <TableHead className="min-w-[100px]">{t("sku")}</TableHead>
            <TableHead className="min-w-[100px]">{t("category")}</TableHead>
            <TableHead className="min-w-[100px]">{t("price")}</TableHead>
            <TableHead className="min-w-[80px]">{t("unit")}</TableHead>
            <TableHead className="min-w-[80px]">{t("status")}</TableHead>
            <TableHead className="w-[80px]">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                {t("noProducts")}
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => (
              <TableRow key={p.id} className="group hover:bg-muted/30">
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{p.sku}</TableCell>
                <TableCell>
                  {p.category && (
                    <Badge variant="outline" className="text-xs">{p.category}</Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-sm text-secondary">
                  {formatCurrency(p.price, fmtLocale)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t(`unit_${p.unit}` as "unit_unit")}
                </TableCell>
                <TableCell>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: p.active ? "#10b98120" : "#6b728020",
                      color: p.active ? "#10b981" : "#6b7280",
                      borderColor: p.active ? "#10b98140" : "#6b728040",
                    }}
                  >
                    {p.active ? t("statusActive") : t("statusInactive")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(p)}>
                          <Pencil className="h-4 w-4 me-2" />
                          {tc("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(p.id)}
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
