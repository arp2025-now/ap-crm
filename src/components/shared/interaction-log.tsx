"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInteractions } from "@/hooks/use-interactions";
import { formatDate } from "@/lib/utils";

interface InteractionLogProps {
  entityType: "lead" | "customer";
  entityId: string;
  locale?: string;
}

export function InteractionLog({ entityType, entityId, locale = "he" }: InteractionLogProps) {
  const t = useTranslations("interactions");
  const { addInteraction, deleteInteraction, getInteractionsForEntity } = useInteractions();
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const interactions = getInteractionsForEntity(entityType, entityId);

  const handleAdd = () => {
    if (!content.trim()) return;
    addInteraction({ entityType, entityId, content: content.trim() });
    setContent("");
    setIsAdding(false);
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-sky-600" />
          </div>
          <h3 className="text-lg font-bold">{t("title")}</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 me-1" />
          {t("addInteraction")}
        </Button>
      </div>

      {isAdding && (
        <div className="space-y-3 p-4 rounded-xl border bg-sky-50/50 dark:bg-sky-950/20">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPlaceholder")}
            rows={3}
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setContent(""); }}>
              ביטול
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!content.trim()}>
              שמור
            </Button>
          </div>
        </div>
      )}

      {interactions.length === 0 && !isAdding ? (
        <div className="text-center py-8">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t("noInteractions")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("noInteractionsHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="relative p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-wrap">{interaction.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {interaction.createdBy}
                    </span>
                    <span>
                      {formatDate(interaction.createdAt, locale === "he" ? "he-IL" : "en-US")}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
                  onClick={() => deleteInteraction(interaction.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
