import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from './LeadCard'
import type { Lead } from '@/lib/supabase/types'
import type { PipelineStage } from '@/lib/constants'

interface KanbanColumnProps {
  stage: PipelineStage
  leads: Lead[]
}

export function KanbanColumn({ stage, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-64 rounded-xl p-3 transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm text-gray-700">{stage}</h3>
        <span className="text-xs bg-white text-gray-500 rounded-full px-2 py-0.5 font-medium">
          {leads.length}
        </span>
      </div>
      <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
