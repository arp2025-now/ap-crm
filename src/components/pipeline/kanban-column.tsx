import { Droppable } from "@hello-pangea/dnd";
import { useTranslations } from "next-intl";
import { KanbanCard } from "./kanban-card";
import type { Lead, PipelineStage } from "@/lib/types";

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  locale: string;
}

export function KanbanColumn({ stage, leads, locale }: KanbanColumnProps) {
  const t = useTranslations("pipeline");

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
        <h3 className="text-sm font-semibold">
          {locale === "he" ? stage.nameHe : stage.name}
        </h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 p-2 rounded-xl min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-muted/30"
            }`}
          >
            {leads.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">{t("noLeads")}</p>
            )}
            {leads.map((lead, index) => (
              <KanbanCard key={lead.id} lead={lead} index={index} locale={locale} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
