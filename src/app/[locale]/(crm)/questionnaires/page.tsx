"use client";

import { useState } from "react";
import { Plus, BookOpen, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuestionnaires } from "@/hooks/use-questionnaires";
import { QuestionnaireDialog } from "@/components/questionnaires/questionnaire-dialog";
import type { QuestionnaireSubmission, QuestionnaireType } from "@/lib/types";

const TYPE_LABELS: Record<QuestionnaireType, string> = {
  intro: "שאלון היכרות",
  business_mapping: "מיפוי עסקי",
  scalability: "סקיילבליות",
  custom: "מותאם",
};

const TYPE_COLORS: Record<QuestionnaireType, string> = {
  intro: "bg-blue-100 text-blue-700 border-blue-200",
  business_mapping: "bg-violet-100 text-violet-700 border-violet-200",
  scalability: "bg-emerald-100 text-emerald-700 border-emerald-200",
  custom: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function QuestionnairesPage() {
  const { submissions, addSubmission, deleteSubmission } = useQuestionnaires();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewSubmission, setViewSubmission] = useState<QuestionnaireSubmission | undefined>();
  const [typeFilter, setTypeFilter] = useState<QuestionnaireType | "all">("all");

  const filtered = typeFilter === "all" ? submissions : submissions.filter((s) => s.type === typeFilter);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">שאלונים</h1>
          <p className="text-sm text-muted-foreground">{submissions.length} הגשות סה"כ</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 me-1" />
          שאלון חדש
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "intro", "business_mapping", "scalability", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              typeFilter === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-input hover:bg-muted/50"
            }`}
          >
            {t === "all" ? "הכל" : TYPE_LABELS[t]}
            <span className="ms-1.5 opacity-60">
              {t === "all" ? submissions.length : submissions.filter((s) => s.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-3 opacity-30" />
          <p>אין שאלונים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div key={sub.id} className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{TYPE_LABELS[sub.type]}</span>
                      <Badge className={`text-xs border ${TYPE_COLORS[sub.type]}`}>
                        {TYPE_LABELS[sub.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sub.submittedAt
                        ? new Date(sub.submittedAt).toLocaleDateString("he-IL")
                        : new Date(sub.createdAt).toLocaleDateString("he-IL")}
                    </p>
                    {sub.aiSummary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{sub.aiSummary}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => setViewSubmission(sub)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                    onClick={() => deleteSubmission(sub.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuestionnaireDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={addSubmission}
      />

      {viewSubmission && (
        <QuestionnaireDialog
          open={true}
          onClose={() => setViewSubmission(undefined)}
          onSave={async () => {}}
          viewOnly={viewSubmission}
        />
      )}
    </div>
  );
}
