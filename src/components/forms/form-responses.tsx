"use client";

import { useTranslations, useLocale } from "next-intl";
import { MessageSquare, User, Mail, Clock } from "lucide-react";
import type { WebForm, WebFormResponse } from "@/lib/types";

interface FormResponsesProps {
  form: WebForm;
  responses: WebFormResponse[];
}

export function FormResponses({ form, responses }: FormResponsesProps) {
  const t = useTranslations("forms");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  const getFieldLabel = (fieldId: string) => {
    const field = form.fields.find((f) => f.id === fieldId);
    return field?.label || fieldId;
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">{t("noResponses")}</p>
        <p className="text-xs">{t("noResponsesHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div
          key={response.id}
          className="border rounded-xl p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900"
        >
          {/* Response header */}
          <div className="flex items-center gap-4 mb-3 pb-3 border-b">
            {response.respondentName && (
              <div className="flex items-center gap-1.5 text-sm">
                <User className="h-3.5 w-3.5 text-teal-500" />
                <span className="font-medium">{response.respondentName}</span>
              </div>
            )}
            {response.respondentEmail && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{response.respondentEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ms-auto">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(response.submittedAt).toLocaleDateString(fmtLocale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-2">
            {Object.entries(response.answers).map(([fieldId, value]) => (
              <div key={fieldId} className="flex gap-2">
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 min-w-[120px] shrink-0">
                  {getFieldLabel(fieldId)}:
                </span>
                <span className="text-sm">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
