"use client";

import { useTranslations } from "next-intl";
import { GitBranch } from "lucide-react";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { StageManager } from "@/components/pipeline/stage-manager";
import { usePipeline } from "@/hooks/use-pipeline";

export default function PipelinePage() {
  const t = useTranslations("pipeline");
  const { stages, addStage, deleteStage, moveLead, getLeadsByStage } = usePipeline();

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <GitBranch className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StageManager stages={stages} onAddStage={addStage} onDeleteStage={deleteStage} />
          </div>
        </div>
      </div>

      <KanbanBoard stages={stages} getLeadsByStage={getLeadsByStage} onMoveLead={moveLead} />
    </div>
  );
}
