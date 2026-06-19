'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Lead } from '@/lib/types'
import type { DbLead } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

function dbToLead(row: DbLead): Lead {
  return {
    id: row.id,
    customerName: row.full_name,
    customerEmail: row.email ?? undefined,
    phone: row.phone ?? undefined,
    company: row.company ?? undefined,
    status: row.status,
    source: row.source ?? undefined,
    heatLevel: (row.heat_level as Lead['heatLevel']) ?? 'cold',
    pipelineValue: row.pipeline_value ?? 0,
    aiScore: row.ai_score ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customFields: {},
  }
}

function leadToDb(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Partial<DbLead> {
  return {
    full_name: data.customerName,
    email: data.customerEmail ?? null,
    phone: data.phone ?? null,
    company: data.company ?? null,
    status: data.status,
    source: data.source ?? 'אחר',
    heat_level: data.heatLevel ?? 'cold',
    pipeline_value: data.pipelineValue ?? 0,
    ai_score: data.aiScore ?? null,
    notes: data.notes ?? null,
  }
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setLeads(data.map(dbToLead))
  }, [supabase])

  useEffect(() => { load() }, [load])

  const addLead = useCallback(async (data: Omit<Lead, 'id' | 'serialNumber' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'customerId' | 'assignedAgentId' | 'lastContactAt'>) => {
    const { data: row, error } = await supabase
      .from('leads')
      .insert(leadToDb(data))
      .select()
      .single()
    if (error) throw error
    const newLead = dbToLead(row)
    setLeads((prev) => [newLead, ...prev])
    return newLead
  }, [supabase])

  const updateLead = useCallback(async (id: string, data: Partial<Lead>) => {
    const updates: Partial<DbLead> = {}
    if (data.customerName !== undefined) updates.full_name = data.customerName
    if (data.customerEmail !== undefined) updates.email = data.customerEmail
    if (data.phone !== undefined) updates.phone = data.phone
    if (data.company !== undefined) updates.company = data.company
    if (data.status !== undefined) updates.status = data.status
    if (data.source !== undefined) updates.source = data.source
    if (data.heatLevel !== undefined) updates.heat_level = data.heatLevel
    if (data.pipelineValue !== undefined) updates.pipeline_value = data.pipelineValue
    if (data.notes !== undefined) updates.notes = data.notes

    const { data: row, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const updated = dbToLead(row)
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
  }, [supabase])

  const deleteLead = useCallback(async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }, [supabase])

  return { leads, addLead, updateLead, deleteLead }
}
