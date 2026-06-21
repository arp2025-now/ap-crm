"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { QuestionnaireSubmission, QuestionnaireType } from "@/lib/types";

const QUESTIONNAIRE_TYPES: { value: QuestionnaireType; label: string; description: string }[] = [
  { value: "intro", label: "שאלון היכרות", description: "מידע בסיסי על הלקוח ועסקו" },
  { value: "business_mapping", label: "שאלון מיפוי עסקי", description: "ניתוח תהליכים ופירוט צרכים" },
  { value: "scalability", label: "שאלון סקיילבליות", description: "מוכנות לצמיחה ואוטומציה" },
  { value: "custom", label: "שאלון מותאם", description: "תוכן חופשי לפי הצורך" },
];

const INTRO_QUESTIONS = [
  { key: "business_name", label: "שם העסק" },
  { key: "business_type", label: "סוג העסק / תחום" },
  { key: "years_in_business", label: "כמה שנים בתחום?" },
  { key: "team_size", label: "גודל הצוות" },
  { key: "monthly_revenue", label: "מחזור חודשי משוער" },
  { key: "main_challenge", label: "האתגר העיקרי שלך כרגע" },
  { key: "heard_about", label: "איך שמעת עלינו?" },
];

const BUSINESS_MAPPING_QUESTIONS = [
  { key: "current_crm", label: "מה CRM / כלי ניהול לקוחות נוכחי?" },
  { key: "main_process", label: "תאר את תהליך המכירה שלך (מליד עד תשלום)" },
  { key: "manual_tasks", label: "אילו משימות חוזרות על עצמן ומבוצעות ידנית?" },
  { key: "pain_points", label: "אילו תהליכים גוזלים הכי הרבה זמן?" },
  { key: "tools_used", label: "אילו כלים / תוכנות את משתמש.ת בהם?" },
  { key: "integration_needs", label: "מה חשוב לך שיתחבר למה?" },
  { key: "budget_range", label: "תקציב משוער לפרויקט" },
  { key: "timeline", label: "מתי צריך שיהיה מוכן?" },
];

const SCALABILITY_QUESTIONS = [
  { key: "growth_goal", label: "מה יעד הצמיחה שלך ב-12 חודש?" },
  { key: "bottleneck", label: "מה הצוואר-בקבוק שמונע צמיחה?" },
  { key: "automation_readiness", label: "האם יש תהליכים כתובים ומתועדים?" },
  { key: "tech_comfort", label: "רמת נוחות עם טכנולוגיה (1-10)" },
  { key: "past_automations", label: "האם ניסית אוטומציות בעבר? תאר" },
  { key: "team_adoption", label: "האם הצוות מוכן לאמץ מערכות חדשות?" },
  { key: "roi_expectation", label: "מה ה-ROI שתרצה לראות מהפרויקט?" },
  { key: "biggest_fear", label: "מה הכי מפחיד אותך בתהליך?" },
  { key: "decision_process", label: "מי מקבל ההחלטות בפרויקט?" },
  { key: "next_step", label: "מה הצעד הבא שתרצה לקחת?" },
];

function getQuestions(type: QuestionnaireType) {
  switch (type) {
    case "intro": return INTRO_QUESTIONS;
    case "business_mapping": return BUSINESS_MAPPING_QUESTIONS;
    case "scalability": return SCALABILITY_QUESTIONS;
    default: return [];
  }
}

interface QuestionnaireDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<QuestionnaireSubmission, "id" | "createdAt">) => Promise<QuestionnaireSubmission | void>;
  defaultLeadId?: string;
  defaultClientId?: string;
  viewOnly?: QuestionnaireSubmission;
}

export function QuestionnaireDialog({ open, onClose, onSave, defaultLeadId, defaultClientId, viewOnly }: QuestionnaireDialogProps) {
  const [step, setStep] = useState<"type" | "form">("type");
  const [type, setType] = useState<QuestionnaireType>("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customText, setCustomText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && !viewOnly) {
      setStep("type");
      setType("intro");
      setAnswers({});
      setCustomText("");
    }
  }, [open, viewOnly]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalAnswers = type === "custom"
        ? { text: customText }
        : answers;
      await onSave({
        type,
        leadId: defaultLeadId,
        clientId: defaultClientId,
        answers: finalAnswers,
        submittedAt: new Date().toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // View-only mode
  if (viewOnly) {
    const TYPE_LABEL = QUESTIONNAIRE_TYPES.find((t) => t.value === viewOnly.type)?.label ?? viewOnly.type;
    const questions = getQuestions(viewOnly.type);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg my-8">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-2xl">
            <h2 className="text-lg font-bold">{TYPE_LABEL}</h2>
            {viewOnly.submittedAt && (
              <p className="text-sm text-white/70">{new Date(viewOnly.submittedAt).toLocaleDateString("he-IL")}</p>
            )}
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {questions.length > 0 ? questions.map((q) => (
              <div key={q.key}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">{q.label}</p>
                <p className="text-sm bg-muted/40 rounded-lg px-3 py-2">{(viewOnly.answers[q.key] as string) || "—"}</p>
              </div>
            )) : (
              <p className="text-sm whitespace-pre-wrap">{String(viewOnly.answers.text ?? "")}</p>
            )}
            {viewOnly.aiSummary && (
              <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
                <p className="text-xs font-semibold text-violet-600 mb-1">סיכום AI</p>
                <p className="text-sm text-violet-900">{viewOnly.aiSummary}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end px-6 pb-6">
            <Button variant="outline" onClick={onClose}>סגור</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-2xl">
          <h2 className="text-lg font-bold">שאלון חדש</h2>
        </div>

        {step === "type" ? (
          <div className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground mb-4">בחר סוג שאלון:</p>
            {QUESTIONNAIRE_TYPES.map((qt) => (
              <button
                key={qt.value}
                onClick={() => setType(qt.value)}
                className={`w-full text-start rounded-xl border p-4 transition-colors ${
                  type === qt.value ? "border-violet-400 bg-violet-50" : "border-input hover:bg-muted/50"
                }`}
              >
                <p className="font-semibold text-sm">{qt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{qt.description}</p>
              </button>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>ביטול</Button>
              <Button onClick={() => setStep("form")}>המשך</Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {type === "custom" ? (
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="כתוב את תוכן השאלון כאן..."
                rows={10}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            ) : (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pe-1">
                {getQuestions(type).map((q) => (
                  <div key={q.key}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{q.label}</label>
                    <input
                      value={answers[q.key] ?? ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("type")}>חזרה</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>ביטול</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "שומר..." : "שמור שאלון"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
