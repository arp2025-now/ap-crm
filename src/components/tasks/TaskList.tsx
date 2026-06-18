'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/lib/supabase/types'

interface TaskListProps {
  initialTasks: Task[]
  showEntity?: boolean
}

export function TaskList({ initialTasks, showEntity = false }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks)

  async function toggleComplete(task: Task) {
    const completed_at = task.completed_at ? null : new Date().toISOString()

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed_at } : t))

    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_at }),
    })
  }

  const open = tasks.filter(t => !t.completed_at)
  const done = tasks.filter(t => t.completed_at)

  return (
    <div className="space-y-2">
      {open.length === 0 && done.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">אין משימות</p>
      )}
      {open.map(task => (
        <TaskRow key={task.id} task={task} onToggle={() => toggleComplete(task)} />
      ))}
      {done.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer">
            {done.length} משימות שהושלמו
          </summary>
          <div className="space-y-2 mt-2 opacity-50">
            {done.map(task => (
              <TaskRow key={task.id} task={task} onToggle={() => toggleComplete(task)} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
      task.completed_at ? 'border-gray-100' : 'border-gray-200'
    }`}>
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
          task.completed_at
            ? 'bg-green-500 border-green-500'
            : task.priority === 'גבוה'
            ? 'border-red-400 hover:bg-red-50'
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed_at ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </p>
        {task.details && <p className="text-xs text-gray-500 mt-0.5">{task.details}</p>}
        {task.due_at && (
          <p className={`text-xs mt-0.5 ${
            !task.completed_at && new Date(task.due_at) < new Date()
              ? 'text-red-500 font-medium'
              : 'text-gray-400'
          }`}>
            עד {formatDate(task.due_at)}
          </p>
        )}
      </div>
    </div>
  )
}
