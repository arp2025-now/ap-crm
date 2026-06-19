"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { IncomeRecord, IncomeCategory, FinanceStatus, Currency } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<IncomeRecord, "id" | "createdAt" | "updatedAt">) => void;
  leads: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  initial?: IncomeRecord;
}

const CATEGORIES: IncomeCategory[] = ["service", "product", "consulting", "subscription", "other"];
const PAYMENT_METHODS = ["transfer", "credit", "cash", "check", "other"];
const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "ILS", label: "₪ ILS", symbol: "₪" },
  { value: "USD", label: "$ USD", symbol: "$" },
  { value: "EUR", label: "€ EUR", symbol: "€" },
  { value: "GBP", label: "£ GBP", symbol: "£" },
];

export function IncomeDialog({ open, onClose, onSave, leads, customers, initial }: Props) {
  const t = useTranslations("finance");

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("ILS");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IncomeCategory>("service");
  const [linkedLeadId, setLinkedLeadId] = useState("");
  const [linkedCustomerId, setLinkedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState<FinanceStatus>("completed");
  const [notes, setNotes] = useState("");

  // Reset all fields when dialog opens
  useEffect(() => {
    if (open) {
      setAmount(initial?.amount?.toString() ?? "");
      setCurrency(initial?.currency ?? "ILS");
      setDate(initial?.date ?? new Date().toISOString().slice(0, 10));
      setDescription(initial?.description ?? "");
      setCategory(initial?.category ?? "service");
      setLinkedLeadId(initial?.linkedLeadId ?? "");
      setLinkedCustomerId(initial?.linkedCustomerId ?? "");
      setPaymentMethod(initial?.paymentMethod ?? "transfer");
      setInvoiceNumber(initial?.invoiceNumber ?? "");
      setStatus(initial?.status ?? "completed");
      setNotes(initial?.notes ?? "");
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSave = () => {
    if (!amount || !description) return;
    onSave({
      amount: parseFloat(amount),
      currency,
      date,
      description,
      category,
      linkedLeadId: linkedLeadId || undefined,
      linkedCustomerId: linkedCustomerId || undefined,
      paymentMethod,
      invoiceNumber: invoiceNumber || undefined,
      status,
      notes: notes || undefined,
    });
    onClose();
  };

  const currencySymbol = CURRENCIES.find(c => c.value === currency)?.symbol ?? "₪";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">{initial ? t("editIncome") : t("addIncome")}</h2>

        <div className="space-y-4">
          {/* Amount, Currency & Date */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
            <div>
              <Label>{t("amount")} *</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="text-lg font-bold pe-8"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                  {currencySymbol}
                </span>
              </div>
            </div>
            <div>
              <Label>{t("currency")}</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full h-9 rounded-lg border bg-background px-2 text-sm mt-0.5"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("date")}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>{t("description")} *</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("incomeDescPlaceholder")} />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("category")}</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`incCat_${c}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("status")}</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FinanceStatus)}
                className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="completed">{t("statusCompleted")}</option>
                <option value="pending">{t("statusPending")}</option>
                <option value="cancelled">{t("statusCancelled")}</option>
              </select>
            </div>
          </div>

          {/* Link to lead/customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("linkCustomer")}</Label>
              <select
                value={linkedCustomerId}
                onChange={(e) => setLinkedCustomerId(e.target.value)}
                className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="">{t("noLink")}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("linkLead")}</Label>
              <select
                value={linkedLeadId}
                onChange={(e) => setLinkedLeadId(e.target.value)}
                className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="">{t("noLink")}</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment & Invoice */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("paymentMethod")}</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{t(`pay_${m}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("invoiceNumber")}</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-0001" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>{t("notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1">{t("save")}</Button>
          <Button variant="outline" onClick={onClose}>{t("cancel")}</Button>
        </div>
      </div>
    </div>
  );
}
