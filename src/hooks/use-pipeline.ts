'use client'

import { useCallback } from 'react'
import { usePipelineStages } from './use-pipeline-stages'
import { useLeads } from './use-leads'

export function usePipeline() {
  const { stages, addStage, updateStage, deleteStage } = usePipelineStages()
  const { leads, updateLead } = useLeads()

  const moveLead = useCallback(async (leadId: string, newStatus: string) => {
    await updateLead(leadId, { status: newStatus })
  }, [updateLead])

  const getLeadsByStage = useCallback(
    (stageName: string) => leads.filter((l) => l.status === stageName),
    [leads]
  )

  return { stages, leads, addStage, updateStage, deleteStage, moveLead, getLeadsByStage }
}
