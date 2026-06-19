import { useTranslations, useLocale } from "next-intl";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/lib/types";

const statusStyles: Record<InvoiceStatus, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  overdue: "bg-destructive/15 text-destructive",
};

export function InvoiceTable({ invoices, title }: { invoices: Invoice[]; title: string }) {
  const t = useTranslations("finance");
  const locale = useLocale();

  const statusLabels: Record<InvoiceStatus, string> = {
    paid: t("paid"), pending: t("pending"), overdue: t("overdue"),
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="link" className="text-primary p-0">{t("viewAll")}</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("client")}</TableHead>
              <TableHead>{t("invoiceNum")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="group">
                <TableCell className="font-semibold">{inv.clientName}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{inv.invoiceNumber}</TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(inv.amount, locale === "he" ? "he-IL" : "en-US")}
                </TableCell>
                <TableCell>
                  <Badge className={cn("gap-1", statusStyles[inv.status])}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", inv.status === "paid" ? "bg-success" : inv.status === "pending" ? "bg-warning" : "bg-destructive")} />
                    {statusLabels[inv.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
