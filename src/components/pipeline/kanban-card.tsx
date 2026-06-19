import { Draggable } from "@hello-pangea/dnd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCurrency } from "@/lib/utils";
import type { Lead } from "@/lib/types";

interface KanbanCardProps {
  lead: Lead;
  index: number;
  locale: string;
}

export function KanbanCard({ lead, index, locale }: KanbanCardProps) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl border bg-card p-3 shadow-sm transition-shadow ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                {getInitials(lead.customerName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold truncate">{lead.customerName}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
          <p className="text-sm font-bold text-secondary mt-1">
            {formatCurrency(lead.pipelineValue, locale === "he" ? "he-IL" : "en-US")}
          </p>
        </div>
      )}
    </Draggable>
  );
}
