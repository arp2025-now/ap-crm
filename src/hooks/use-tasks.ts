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

function dbToTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.details ?? '',
    status: (row.status as TaskStatus) ?? 'todo',
    priority: (PRIORITY_FROM_DB[row.priority ?? ''] ?? 'medium') as TaskPriority,
    dueDate: row.due_at?.split('T')[0],
    linkedLeadId: row.lead_id ?? undefined,
    linkedCustomerId: row.client_id ?? undefined,
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
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTasks((data as DbTask[]).map(dbToTask))
  }, [supabase])

  useEffect(() => { load() }, [load])

  const addTask = useCallback(async (data: {
    title: string
    description?: string
    priority?: TaskPriority
    dueDate?: string
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
        due_at: data.dueDate ? `${data.dueDate}T00:00:00Z` : null,
        lead_id: data.linkedLeadId ?? null,
        client_id: data.linkedCustomerId ?? null,
      })
      .select()
      .single()
    if (error) throw error
    const task = dbToTask(row as DbTask)
    setTasks((prev) => [task, ...prev])
    return task
  }, [supabase])

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const updates: Partial<DbTask> = {}
    if (data.title !== undefined) updates.title = data.title
    if (data.description !== undefined) updates.details = data.description
    if (data.priority !== undefined) updates.priority = PRIORITY_TO_DB[data.priority] ?? 'בינוני'
    if (data.dueDate !== undefined) updates.due_at = data.dueDate ? `${data.dueDate}T00:00:00Z` : null
    if (data.status !== undefined) {
      updates.status = data.status
      updates.completed_at = data.status === 'done' ? new Date().toISOString() : null
    }
    updates.updated_at = new Date().toISOString()

    const { data: row, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setTasks((prev) => prev.map((t) => (t.id === id ? dbToTask(row as DbTask) : t)))
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
