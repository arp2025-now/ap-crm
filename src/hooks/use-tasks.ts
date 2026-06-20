'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types'
import type { DbTask } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

const PRIORITY_TO_DB: Record<string, string> = {
  low: 'נמוך',
  medium: 'בינוני',
  high: 'גבוה',
}

const PRIORITY_FROM_DB: Record<string, string> = {
  'נמוך': 'low',
  'בינוני': 'medium',
  'גבוה': 'high',
}

type DbTaskWithJoins = DbTask & {
  leads?: { full_name: string } | null
  clients?: { full_name: string } | null
}

function dbToTask(row: DbTaskWithJoins): Task {
  const rawTime = row.due_at?.slice(11, 16)
  return {
    id: row.id,
    title: row.title,
    description: row.details ?? '',
    status: (row.status as TaskStatus) ?? 'todo',
    priority: (PRIORITY_FROM_DB[row.priority ?? ''] ?? 'medium') as TaskPriority,
    dueDate: row.due_at?.split('T')[0],
    dueTime: rawTime && rawTime !== '00:00' ? rawTime : undefined,
    linkedLeadId: row.lead_id ?? undefined,
    linkedLeadName: row.leads?.full_name ?? undefined,
    linkedCustomerId: row.client_id ?? undefined,
    linkedCustomerName: row.clients?.full_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    createdBy: row.assigned_to ?? 'ענת',
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, leads(full_name), clients(full_name)')
      .order('created_at', { ascending: false })
    if (data) setTasks((data as DbTaskWithJoins[]).map(dbToTask))
  }, [supabase])

  useEffect(() => { load() }, [load])

  const addTask = useCallback(async (data: {
    title: string
    description?: string
    priority?: TaskPriority
    dueDate?: string
    dueTime?: string
    linkedLeadId?: string
    linkedLeadName?: string
    linkedCustomerId?: string
    linkedCustomerName?: string
  }) => {
    const { data: row, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        details: data.description ?? null,
        priority: PRIORITY_TO_DB[data.priority ?? 'medium'] ?? 'בינוני',
        status: 'todo',
        due_at: data.dueDate ? `${data.dueDate}T${data.dueTime ?? '00:00'}:00` : null,
        lead_id: data.linkedLeadId ?? null,
        client_id: data.linkedCustomerId ?? null,
      })
      .select('*, leads(full_name), clients(full_name)')
      .single()
    if (error) throw error
    const task = dbToTask(row as DbTaskWithJoins)
    setTasks((prev) => [task, ...prev])
    return task
  }, [supabase])

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const updates: Partial<DbTask> = {}
    if (data.title !== undefined) updates.title = data.title
    if (data.description !== undefined) updates.details = data.description
    if (data.priority !== undefined) updates.priority = PRIORITY_TO_DB[data.priority] ?? 'בינוני'
    if (data.dueDate !== undefined) updates.due_at = data.dueDate ? `${data.dueDate}T${data.dueTime ?? '00:00'}:00` : null
    if (data.status !== undefined) {
      updates.status = data.status
      updates.completed_at = data.status === 'done' ? new Date().toISOString() : null
    }
    updates.updated_at = new Date().toISOString()

    const { data: row, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*, leads(full_name), clients(full_name)')
      .single()
    if (error) throw error
    setTasks((prev) => prev.map((t) => (t.id === id ? dbToTask(row as DbTaskWithJoins) : t)))
  }, [supabase])

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [supabase])

  const getTasksForLead = useCallback((leadId: string) =>
    tasks.filter((t) => t.linkedLeadId === leadId), [tasks])

  const getTasksForCustomer = useCallback((customerId: string) =>
    tasks.filter((t) => t.linkedCustomerId === customerId), [tasks])

  return { tasks, addTask, updateTask, deleteTask, getTasksForLead, getTasksForCustomer }
}
