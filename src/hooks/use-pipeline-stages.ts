'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PipelineStage } from '@/lib/types'
import type { DbPipelineStage } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

function dbToStage(row: DbPipelineStage): PipelineStage {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? '#6366f1',
    order: row.position,
  }
}

export function usePipelineStages() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('pipeline_stages')
      .select('*')
      .order('position')
    if (data) setStages(data.map(dbToStage))
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const addStage = useCallback(async (stage: Omit<PipelineStage, 'id' | 'order'>) => {
    const maxPos = stages.length > 0 ? Math.max(...stages.map((s) => s.order)) : 0
    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert({ name: stage.name, color: stage.color, position: maxPos + 1 })
      .select()
      .single()
    if (error) throw error
    setStages((prev) => [...prev, dbToStage(data)])
  }, [stages, supabase])

  const updateStage = useCallback(async (id: string, updates: Partial<PipelineStage>) => {
    const dbUpdates: Partial<DbPipelineStage> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.color !== undefined) dbUpdates.color = updates.color
    if (updates.order !== undefined) dbUpdates.position = updates.order
    const { error } = await supabase.from('pipeline_stages').update(dbUpdates).eq('id', id)
    if (error) throw error
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [supabase])

  const deleteStage = useCallback(async (id: string) => {
    const { error } = await supabase.from('pipeline_stages').delete().eq('id', id)
    if (error) throw error
    setStages((prev) => prev.filter((s) => s.id !== id))
  }, [supabase])

  return { stages, addStage, updateStage, deleteStage, loading }
}
