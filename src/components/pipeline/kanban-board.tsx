"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useLocale } from "next-intl";
import { KanbanColumn } from "./kanban-column";
import type { PipelineStage, Lead } from "@/lib/types";

interface KanbanBoardProps {
  stages: PipelineStage[];
  getLeadsByStage: (stageId: string) => Lead[];
  onMoveLead: (leadId: string, newStatus: string) => void;
}

export function KanbanBoard({ stages, getLeadsByStage, onMoveLead }: KanbanBoardProps) {
  const locale = useLocale();
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.droppableId === result.destination.droppableId && result.source.index === result.destination.index) return;
    onMoveLead(result.draggableId, result.destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sorted.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={getLeadsByStage(stage.id)}
            locale={locale}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
