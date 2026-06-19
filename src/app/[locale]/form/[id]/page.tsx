"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckCircle2, Star, ClipboardList, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WebForm, WebFormField, WebFormResponse, BrandingSettings } from "@/lib/types";

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

export default function PublicFormPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("forms");
  const formId = params.id as string;

  const [form, setForm] = useState<WebForm | null>(null);
  const [brand, setBrand] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | string[]>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedBranding = loadFromStorage<BrandingSettings>("crm-branding");
    if (savedBranding) setBrand({ ...DEFAULT_BRANDING, ...savedBranding });

    const forms = loadFromStorage<WebForm[]>("crm-forms") ?? [];
    const found = forms.find((f) => f.id === formId) ?? null;
    setForm(found);

    // Apply default values from field config
    if (found) {
      const defaults: Record<string, string | number | boolean | string[]> = {};
      for (const field of found.fields) {
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
          defaults[field.id] = field.defaultValue as string | number | boolean;
        } else if (field.type === "date" && field.dateDefaultToday) {
          defaults[field.id] = new Date().toISOString().split("T")[0];
        }
      }
      if (Object.keys(defaults).length > 0) {
        setAnswers(defaults);
      }
    }

    setLoaded(true);
  }, [formId]);

  const updateAnswer = (fieldId: string, value: string | number | boolean | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete(fieldId);
      return next;
    });
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const current = (answers[fieldId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    updateAnswer(fieldId, updated);
  };

  const handleSubmit = () => {
    if (!form) return;

    // Validate required fields
    const newErrors = new Set<string>();
    for (const field of form.fields) {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
          newErrors.add(field.id);
        }
      }
    }

    if (newErrors.size > 0) {
      setErrors(newErrors);
      return;
    }

    const response: WebFormResponse = {
      id: `resp-${Date.now()}`,
      formId: form.id,
      answers,
      respondentName: respondentName || undefined,
      respondentEmail: respondentEmail || undefined,
      submittedAt: new Date().toISOString(),
    };

    // Save response
    try {
      const saved = localStorage.getItem("crm-form-responses");
      const all: WebFormResponse[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem("crm-form-responses", JSON.stringify([response, ...all]));

      // Update form response count
      const formsSaved = localStorage.getItem("crm-forms");
      if (formsSaved) {
        const forms: WebForm[] = JSON.parse(formsSaved);
        const updated = forms.map((f) =>
          f.id === form.id ? { ...f, responseCount: f.responseCount + 1 } : f
        );
        localStorage.setItem("crm-forms", JSON.stringify(updated));
      }
    } catch {
      // silent
    }

    setSubmitted(true);
  };

  // Loading
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-pulse text-muted-foreground">...</div>
      </div>
    );
  }

  // Not found
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">{t("formNotFound")}</p>
      </div>
    );
  }

  // Closed
  if (form.status === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">{t("formClosed")}</p>
        </div>
      </div>
    );
  }

  // Thank you
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950">
        <div className="text-center p-8">
          <div
            className="h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: brand.primaryColor + "20" }}
          >
            <CheckCircle2 className="h-10 w-10" style={{ color: brand.primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("thankYou")}</h2>
          <p className="text-muted-foreground">{t("thankYouMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Branded Header */}
        <div
          className="rounded-t-2xl p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            {brand.logoDataUrl && (
              <img
                src={brand.logoDataUrl}
                alt={brand.companyName}
                className="h-10 w-10 rounded-lg object-contain bg-white/20 p-1"
              />
            )}
            <span className="text-sm text-white/70">{brand.companyName}</span>
          </div>
          <h1 className="text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-white/80 text-sm mt-1">{form.description}</p>
          )}
        </div>

        {/* Form Body */}
        <div className="bg-white dark:bg-card rounded-b-2xl shadow-xl p-6 space-y-5">
          {/* Respondent Info */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label className="text-sm font-medium">{t("respondentName")}</label>
              <Input
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("respondentEmail")}</label>
              <Input
                type="email"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Fields */}
          {form.fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {errors.has(field.id) && (
                <p className="text-xs text-red-500">{field.label} — required</p>
              )}
              {renderField(field, answers, updateAnswer, handleCheckboxToggle)}
            </div>
          ))}

          {/* Submit */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-base font-semibold"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Send className="h-4 w-4 me-2" />
              {t("submitForm")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PHONE_PREFIXES: Record<string, string> = {
  IL: "+972",
  US: "+1",
  GB: "+44",
  DE: "+49",
  FR: "+33",
};

function renderField(
  field: WebFormField,
  answers: Record<string, string | number | boolean | string[]>,
  updateAnswer: (id: string, val: string | number | boolean | string[]) => void,
  handleCheckboxToggle: (id: string, opt: string) => void,
) {
  const value = answers[field.id];

  switch (field.type) {
    case "text":
    case "email":
      return (
        <Input
          type={field.type}
          value={(value as string) || ""}
          onChange={(e) => updateAnswer(field.id, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          minLength={field.minLength}
        />
      );

    case "phone": {
      const prefix = field.phoneCountry ? PHONE_PREFIXES[field.phoneCountry] : undefined;
      if (prefix) {
        return (
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 rounded-lg border border-input bg-muted text-sm text-muted-foreground min-w-[60px] justify-center">
              {prefix}
            </span>
            <Input
              type="tel"
              value={(value as string) || ""}
              onChange={(e) => updateAnswer(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="flex-1"
            />
          </div>
        );
      }
      return (
        <Input
          type="tel"
          value={(value as string) || ""}
          onChange={(e) => updateAnswer(field.id, e.target.value)}
          placeholder={field.placeholder}
        />
      );
    }

    case "textarea":
      return (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => updateAnswer(field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          maxLength={field.maxLength}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      );

    case "number": {
      const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^\d.\-]/g, "");
        updateAnswer(field.id, raw ? Number(raw) : "");
      };

      // Format display value with thousands separator and decimal places
      let displayValue = "";
      if (value !== undefined && value !== "") {
        const num = Number(value);
        if (!isNaN(num)) {
          if (field.numberThousandsSeparator || field.numberDecimalPlaces !== undefined) {
            displayValue = num.toLocaleString("en-US", {
              useGrouping: !!field.numberThousandsSeparator,
              minimumFractionDigits: field.numberDecimalPlaces ?? 0,
              maximumFractionDigits: field.numberDecimalPlaces ?? 10,
            });
          } else {
            displayValue = String(num);
          }
        }
      }

      return (
        <Input
          type={field.numberThousandsSeparator ? "text" : "number"}
          value={field.numberThousandsSeparator ? displayValue : ((value as number) ?? "")}
          onChange={field.numberThousandsSeparator ? handleNumberChange : (e) => updateAnswer(field.id, e.target.value ? Number(e.target.value) : "")}
          placeholder={field.placeholder}
          inputMode="decimal"
        />
      );
    }

    case "date":
      return (
        <Input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => updateAnswer(field.id, e.target.value)}
        />
      );

    case "select":
      if (field.selectMultiple) {
        // Multiple selection - render as checkboxes
        const selected = (value as string[]) || [];
        return (
          <div className="space-y-2 rounded-lg border border-input p-3">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => {
                    const updated = selected.includes(opt)
                      ? selected.filter((v) => v !== opt)
                      : [...selected, opt];
                    updateAnswer(field.id, updated);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <select
          value={(value as string) || ""}
          onChange={(e) => updateAnswer(field.id, e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">{field.placeholder || "---"}</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case "checkbox":
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={((value as string[]) || []).includes(opt)}
                onChange={() => handleCheckboxToggle(field.id, opt)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "rating": {
      const maxStars = field.ratingMax ?? 5;
      return (
        <div className="flex gap-1">
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => updateAnswer(field.id, star)}
              className="p-1"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  (value as number) >= star
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      );
    }

    default:
      return (
        <Input
          value={(value as string) || ""}
          onChange={(e) => updateAnswer(field.id, e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}
