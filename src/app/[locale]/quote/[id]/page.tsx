"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { SignaturePad } from "@/components/quotes/signature-pad";
import { formatCurrency } from "@/lib/utils";
import { mockQuotes, mockCustomers } from "@/lib/mock-data";
import type { Quote, Customer, BrandingSettings } from "@/lib/types";

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const DEFAULT_BRANDING: BrandingSettings = {
  companyName: "AP Automations",
  contactEmail: "anat.ugc@gmail.com",
  primaryColor: "#4338ca",
  secondaryColor: "#0d9488",
};

export default function PublicQuotePage() {
  const params = useParams();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("quotes");
  const quoteId = params.id as string;
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";
  const BackArrow = locale === "he" ? ArrowRight : ArrowLeft;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [brand, setBrand] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const savedBranding = loadFromStorage<BrandingSettings>("crm-branding");
    if (savedBranding) setBrand({ ...DEFAULT_BRANDING, ...savedBranding });

    const quotes = loadFromStorage<Quote[]>("crm-quotes") ?? mockQuotes;
    const q = quotes.find((qt) => qt.id === quoteId) ?? null;
    setQuote(q);
    if (q) {
      const customers = loadFromStorage<Customer[]>("crm-customers") ?? mockCustomers;
      setCustomer(customers.find((c) => c.id === q.customerId) ?? null);
    }
  }, [quoteId]);

  const handleSign = (dataUrl: string) => {
    if (!quote) return;
    const now = new Date().toISOString();
    const updated: Quote = {
      ...quote,
      status: "signed",
      signatureDataUrl: dataUrl,
      signedAt: now,
      updatedAt: now,
    };

    const quotes = loadFromStorage<Quote[]>("crm-quotes") ?? [];
    const updatedQuotes = quotes.map((q) => (q.id === quoteId ? updated : q));
    localStorage.setItem("crm-quotes", JSON.stringify(updatedQuotes));
    setQuote(updated);
    setSigned(true);
  };

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">{t("quoteNotFound")}</p>
      </div>
    );
  }

  const showVat = quote.includeVat ?? true;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 print:bg-white print:py-0">
      {/* Back Button */}
      <div className="max-w-3xl mx-auto mb-3 print:hidden">
        <button
          onClick={() => router.push(`/${locale}/quotes`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-card border rounded-lg px-3 py-2 shadow-sm"
        >
          <BackArrow className="h-4 w-4" />
          {t("backToQuotes")}
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-card rounded-2xl border shadow-lg overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        {/* Branded Header */}
        <div className="p-8 print:print-color-exact" style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.primaryColor}cc)` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {brand.logoDataUrl && (
                <img src={brand.logoDataUrl} alt="" className="h-12 w-12 rounded-xl object-contain bg-white/20 p-1" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {brand.companyName}
                </h1>
                <p className="text-sm text-white/70 mt-1">{brand.contactEmail}</p>
              </div>
            </div>
            <div className="text-end">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 inline-block">
                <p className="font-mono font-bold text-lg text-white">
                  {quote.quoteNumber}
                </p>
                <p className="text-xs text-white/70">
                  {new Date(quote.createdAt).toLocaleDateString(fmtLocale)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Customer Details */}
          {customer && (
            <div className="border-s-4 rounded-lg p-4" style={{ borderColor: brand.primaryColor, backgroundColor: `${brand.primaryColor}0d` }}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{t("customer")}</p>
                  <p className="font-bold text-base">{customer.name}</p>
                  <p className="text-muted-foreground">{customer.company}</p>
                </div>
                <div className="text-end">
                  <p className="text-muted-foreground text-xs mb-1">{t("validUntil")}</p>
                  <p className="font-bold text-base">
                    {quote.validUntil
                      ? new Date(quote.validUntil).toLocaleDateString(fmtLocale)
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white" style={{ backgroundColor: brand.primaryColor }}>
                  <th className="px-4 py-3 text-start font-semibold">#</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("productName")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("quantity")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("unitPrice")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("discount")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("lineTotal")}</th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((item, idx) => (
                  <tr key={item.id} className="border-t even:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.productName}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatCurrency(item.unitPrice, fmtLocale)}</td>
                    <td className="px-4 py-3">{item.discount > 0 ? `${item.discount}%` : "—"}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(item.total, fmtLocale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 rounded-xl bg-secondary/5 border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">{formatCurrency(quote.subtotal, fmtLocale)}</span>
              </div>
              {quote.discountTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("discountTotal")}
                    {(quote.globalDiscount ?? 0) > 0 && <span className="text-xs ms-1">({quote.globalDiscount}%)</span>}
                  </span>
                  <span className="text-destructive font-medium">-{formatCurrency(quote.discountTotal, fmtLocale)}</span>
                </div>
              )}
              {showVat && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("taxRate")} ({quote.taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(quote.taxAmount, fmtLocale)}</span>
                </div>
              )}
              <div className="text-white rounded-lg px-4 py-2.5 flex justify-between font-bold text-base mt-2" style={{ backgroundColor: brand.primaryColor }}>
                <span>{t("grandTotal")}</span>
                <span>{formatCurrency(quote.total, fmtLocale)}</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          {(quote.sections && quote.sections.length > 0) ? (
            <div className="space-y-3">
              {[...quote.sections].sort((a, b) => a.order - b.order).map((section, idx) => (
                section.content ? (
                  <div key={section.id || idx} className="rounded-lg border p-4">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold mb-2"
                      style={{
                        backgroundColor: idx % 2 === 0 ? `${brand.secondaryColor}18` : `${brand.primaryColor}15`,
                        color: idx % 2 === 0 ? brand.secondaryColor : brand.primaryColor,
                      }}
                    >
                      {section.title}
                    </span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                  </div>
                ) : null
              ))}
            </div>
          ) : (quote.notes || quote.terms) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quote.notes && (
                <div className="rounded-lg border p-4">
                  <span className="inline-block bg-secondary/10 text-secondary rounded-full px-3 py-1 text-xs font-semibold mb-2">
                    {t("notes")}
                  </span>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
              {quote.terms && (
                <div className="rounded-lg border p-4">
                  <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-2">
                    {t("terms")}
                  </span>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.terms}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Signature Section */}
          <div className="border-t pt-6 print:break-inside-avoid">
            <h3 className="text-sm font-semibold mb-3">{t("signatureTitle")}</h3>

            {quote.status === "signed" && quote.signatureDataUrl ? (
              <div className="space-y-2">
                <div className="rounded-lg border bg-white p-4 flex items-center gap-4">
                  <img
                    src={quote.signatureDataUrl}
                    alt="Signature"
                    className="h-16 object-contain"
                  />
                  <div className="flex items-center gap-2 text-sm" style={{ color: brand.secondaryColor }}>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      {t("signedOn")}{" "}
                      {quote.signedAt
                        ? new Date(quote.signedAt).toLocaleDateString(fmtLocale)
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            ) : quote.status === "sent" ? (
              <div className="print:hidden">
                <SignaturePad onSign={handleSign} />
              </div>
            ) : quote.status === "draft" ? (
              <p className="text-muted-foreground text-sm">{t("quoteNotSent")}</p>
            ) : null}

            {signed && (
              <div className="mt-4 rounded-lg border p-4 flex items-center gap-3" style={{ backgroundColor: `${brand.secondaryColor}15`, borderColor: `${brand.secondaryColor}30`, color: brand.secondaryColor }}>
                <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                <p className="text-sm font-medium">{t("signedSuccessfully")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 pb-6">
          <div className="h-1 rounded-full mb-4" style={{ background: `linear-gradient(to right, ${brand.primaryColor}, ${brand.secondaryColor})` }} />
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">{t("thankYouMessage")}</p>
            <p className="text-xs text-muted-foreground/60 font-medium">{brand.companyName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
