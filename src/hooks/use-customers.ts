'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Customer } from '@/lib/types'
import type { DbClient } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

function dbToCustomer(row: DbClient): Customer {
  return {
    id: row.id,
    name: row.full_name,
    phone: row.phone ?? '',
    email: row.email ?? '',
    company: row.company ?? '',
    industry: row.industry ?? '',
    assignedAgentId: row.assigned_agent_id ?? '',
    tags: row.tags ?? [],
    sentimentScore: row.sentiment_score ?? 5,
    lifetimeValue: row.lifetime_value ?? 0,
    healthGrade: row.health_grade ?? 'B',
    lifecycleStage: row.lifecycle_stage ?? 'active',
    createdAt: row.created_at,
  }
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCustomers(data.map(dbToCustomer))
  }, [supabase])

  useEffect(() => { load() }, [load])

  const addCustomer = useCallback(async (c: Customer) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        full_name: c.name,
        phone: c.phone || null,
        email: c.email || null,
        company: c.company || null,
        industry: c.industry || null,
        assigned_agent_id: c.assignedAgentId || null,
        tags: c.tags ?? [],
        sentiment_score: c.sentimentScore ?? 5,
        lifetime_value: c.lifetimeValue ?? 0,
        health_grade: c.healthGrade ?? 'B',
        lifecycle_stage: c.lifecycleStage ?? 'active',
      })
      .select()
      .single()
    if (error) throw error
    setCustomers((prev) => [dbToCustomer(data), ...prev])
  }, [supabase])

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    const updates: Partial<DbClient> = {}
    if (data.name !== undefined) updates.full_name = data.name
    if (data.phone !== undefined) updates.phone = data.phone
    if (data.email !== undefined) updates.email = data.email
    if (data.company !== undefined) updates.company = data.company
    if (data.industry !== undefined) updates.industry = data.industry
    if (data.sentimentScore !== undefined) updates.sentiment_score = data.sentimentScore
    if (data.lifetimeValue !== undefined) updates.lifetime_value = data.lifetimeValue
    if (data.healthGrade !== undefined) updates.health_grade = data.healthGrade
    if (data.lifecycleStage !== undefined) updates.lifecycle_stage = data.lifecycleStage

    const { data: row, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setCustomers((prev) => prev.map((c) => (c.id === id ? dbToCustomer(row) : c)))
  }, [supabase])

  const deleteCustomer = useCallback(async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [supabase])

  const nextSerial = useCallback(
    () => customers.length + 1,
    [customers]
  )

  return { customers, addCustomer, updateCustomer, deleteCustomer, nextSerial }
}
