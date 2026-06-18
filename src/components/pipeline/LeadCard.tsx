'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import type { Lead } from '@/lib/supabase/types'

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <a href={`/leads/${lead.id}`} onClick={e => e.stopPropagation()}>
        <p className="font-medium text-sm text-gray-900 hover:text-blue-600">
          {lead.full_name}
        </p>
      </a>
      {lead.phone && (
        <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        {lead.source && (
          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            {lead.source}
          </span>
        )}
        {lead.ai_score && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            lead.ai_score >= 70 ? 'bg-green-100 text-green-700' :
            lead.ai_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {lead.ai_score}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: he })}
      </p>
    </div>
  )
}
