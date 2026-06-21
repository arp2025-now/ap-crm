'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@/lib/types'
import type { DbProject } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

function dbToProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Project['type'],
    status: row.status as Project['status'],
    leadId: row.lead_id ?? undefined,
    clientId: row.client_id ?? undefined,
    startDate: row.start_date ?? undefined,
    expectedEndDate: row.expected_end_date ?? undefined,
    actualEndDate: row.actual_end_date ?? undefined,
    priceExclVat: row.price_excl_vat ?? undefined,
    notes: row.notes ?? undefined,
    specDocUrl: row.spec_doc_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function useProjects(leadId?: string, clientId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    let q = supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (leadId) q = q.eq('lead_id', leadId)
    if (clientId) q = q.eq('client_id', clientId)
    const { data } = await q
    if (data) setProjects(data.map(dbToProject))
  }, [supabase, leadId, clientId])

  useEffect(() => { load() }, [load])

  const addProject = useCallback(async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: row, error } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        type: data.type,
        status: data.status,
        lead_id: data.leadId ?? null,
        client_id: data.clientId ?? null,
        start_date: data.startDate ?? null,
        expected_end_date: data.expectedEndDate ?? null,
        actual_end_date: data.actualEndDate ?? null,
        price_excl_vat: data.priceExclVat ?? null,
        notes: data.notes ?? null,
        spec_doc_url: data.specDocUrl ?? null,
      })
      .select()
      .single()
    if (error) throw error
    const newProject = dbToProject(row)
    setProjects((prev) => [newProject, ...prev])
    return newProject
  }, [supabase])

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    const updates: Partial<DbProject> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.type !== undefined) updates.type = data.type
    if (data.status !== undefined) updates.status = data.status
    if (data.leadId !== undefined) updates.lead_id = data.leadId
    if (data.clientId !== undefined) updates.client_id = data.clientId
    if (data.startDate !== undefined) updates.start_date = data.startDate
    if (data.expectedEndDate !== undefined) updates.expected_end_date = data.expectedEndDate
    if (data.actualEndDate !== undefined) updates.actual_end_date = data.actualEndDate
    if (data.priceExclVat !== undefined) updates.price_excl_vat = data.priceExclVat
    if (data.notes !== undefined) updates.notes = data.notes
    if (data.specDocUrl !== undefined) updates.spec_doc_url = data.specDocUrl

    const { data: row, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const updated = dbToProject(row)
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [supabase])

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [supabase])

  return { projects, addProject, updateProject, deleteProject, reload: load }
}
