"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseReceiptFile } from "@/lib/parse-receipt";
import type { ExpenseRecord, ExpenseCategory, FinanceStatus, Currency } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ExpenseRecord, "id" | "createdAt" | "updatedAt">) => void;
  initial?: ExpenseRecord;
}

const CATEGORIES: ExpenseCategory[] = ["payroll", "software", "marketing", "office", "travel", "professional", "equipment", "other"];
const PAYMENT_METHODS = ["transfer", "credit", "cash", "check", "other"];
const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "ILS", label: "₪ ILS", symbol: "₪" },
  { value: "USD", label: "$ USD", symbol: "$" },
  { value: "EUR", label: "€ EUR", symbol: "€" },
  { value: "GBP", label: "£ GBP", symbol: "£" },
];

export function ExpenseDialog({ open, onClose, onSave, initial }: Props) {
  const t = useTranslations("finance");
  const fileRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("ILS");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("software");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState<FinanceStatus>("completed");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [receiptFileName, setReceiptFileName] = useState("");
  const [uploadMode, setUploadMode] = useState(false);
  const [parsedFromFile, setParsedFromFile] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Reset all fields when dialog opens (or when initial changes for edit mode)
  useEffect(() => {
    if (open) {
      setAmount(initial?.amount?.toString() ?? "");
      setCurrency(initial?.currency ?? "ILS");
      setDate(initial?.date ?? new Date().toISOString().slice(0, 10));
      setDescription(initial?.description ?? "");
      setCategory(initial?.category ?? "software");
      setVendor(initial?.vendor ?? "");
      setPaymentMethod(initial?.paymentMethod ?? "credit");
      setInvoiceNumber(initial?.invoiceNumber ?? "");
      setStatus(initial?.status ?? "completed");
      setNotes(initial?.notes ?? "");
      setIsRecurring(initial?.isRecurring ?? false);
      setRecurringFrequency(initial?.recurringFrequency ?? "monthly");
      setReceiptFileName(initial?.receiptFileName ?? "");
      setUploadMode(false);
      setParsedFromFile(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open, initial]);

  if (!open) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset all fields
    setReceiptFileName(file.name);
    setAmount("");
    setDescription("");
    setCategory("software");
    setVendor("");
    setInvoiceNumber("");
    setIsRecurring(false);
    setRecurringFrequency("monthly");
    setCurrency("ILS");
    setParsedFromFile(false);
    setIsParsing(true);

    // Reset the input so the same file can be re-selected
    e.target.value = "";

    try {
      // Parse the actual file content (PDF text extraction + filename analysis)
      const parsed = await parseReceiptFile(file);

      if (parsed.amount) setAmount(parsed.amount.toString());
      if (parsed.currency) setCurrency(parsed.currency);
      if (parsed.date) setDate(parsed.date);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.vendor) setVendor(parsed.vendor);
      if (parsed.invoiceNumber) setInvoiceNumber(parsed.invoiceNumber);
      if (parsed.isRecurring) {
        setIsRecurring(true);
        if (parsed.recurringFrequency) setRecurringFrequency(parsed.recurringFrequency);
      }

      setParsedFromFile(true);
    } catch (err) {
      console.error("File parsing error:", err);
      // Fallback: just use filename as description
      setDescription(file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));
      setParsedFromFile(true);
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFileName("");
    setParsedFromFile(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = () => {
    if (!amount || !description) return;
    onSave({
      amount: parseFloat(amount),
      currency,
      date,
      description,
      category,
      vendor: vendor || undefined,
      paymentMethod,
      invoiceNumber: invoiceNumber || undefined,
      status,
      notes: notes || undefined,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      receiptFileName: receiptFileName || undefined,
    });
    onClose();
  };

  const currencySymbol = CURRENCIES.find(c => c.value === currency)?.symbol ?? "₪";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">{initial ? t("editExpense") : t("addExpense")}</h2>

        {/* Entry mode toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={!uploadMode ? "default" : "outline"}
            size="sm"
            onClick={() => setUploadMode(false)}
          >
            {t("manualEntry")}
          </Button>
          <Button
            variant={uploadMode ? "default" : "outline"}
            size="sm"
            onClick={() => setUploadMode(true)}
          >
            <Upload className="h-4 w-4 me-1" />
            {t("uploadReceipt")}
          </Button>
        </div>

        {/* File upload area */}
        {uploadMode && (
          <div
            className="border-2 border-dashed border-blue-300 rounded-xl p-6 mb-4 text-center cursor-pointer hover:bg-blue-50/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx"
              className="hidden"
              onChange={handleFileUpload}
            />
            {receiptFileName ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{receiptFileName}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                    className="text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    {t("changeFile")}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    {t("removeFile")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-blue-400 mb-2" />
                <p className="text-sm text-muted-foreground">{t("dropFileHere")}</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, CSV, XLSX</p>
              </>
            )}
          </div>
        )}

        {isParsing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("analyzingFile")}
          </div>
        )}

        {parsedFromFile && !isParsing && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-sm text-emerald-700">
            {t("fileAnalyzed")}
          </div>
        )}

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
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("expenseDescPlaceholder")} />
          </div>

          {/* Category & Vendor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("category")}</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full h-9 rounded-lg border bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`expCat_${c}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("vendor")}</Label>
              <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder={t("vendorPlaceholder")} />
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
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-3">
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 h-9 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{t("recurring")}</span>
              </label>
              {isRecurring && (
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as "monthly" | "quarterly" | "yearly")}
                  className="ms-2 h-9 rounded-lg border bg-background px-2 text-sm"
                >
                  <option value="monthly">{t("monthly")}</option>
                  <option value="quarterly">{t("quarterly")}</option>
                  <option value="yearly">{t("yearly")}</option>
                </select>
              )}
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
