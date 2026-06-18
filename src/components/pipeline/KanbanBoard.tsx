'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { PIPELINE_STAGES, type PipelineStage } from '@/lib/constants'
import { KanbanColumn } from './KanbanColumn'
import type { Lead } from '@/lib/supabase/types'

interface KanbanBoardProps {
  initialLeads: Lead[]
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string
    const newStage = over.id as PipelineStage

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStage) return

    // Skip if lead is already being updated (race condition prevention)
    if (updating.has(leadId)) return

    // Mark lead as in-flight
    setUpdating(prev => new Set(prev).add(leadId))

    // Optimistic update
    setLeads(prev =>
      prev.map(l => l.id === leadId ? { ...l, status: newStage } : l)
    )

    // Persist
    try {
      const res = await fetch(`/api/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!res.ok) {
        console.error('Stage update failed, rolling back:', leadId, newStage)
        // Rollback on error
        setLeads(prev =>
          prev.map(l => l.id === leadId ? { ...l, status: lead.status } : l)
        )
      }
    } finally {
      // Always clear in-flight status after fetch completes
      setUpdating(prev => {
        const next = new Set(prev)
        next.delete(leadId)
        return next
      })
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={leads.filter(l => l.status === stage)}
          />
        ))}
      </div>
    </DndContext>
  )
}
