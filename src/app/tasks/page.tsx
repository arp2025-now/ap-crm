import { createServerSupabaseClient } from '@/lib/supabase/server'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskForm } from '@/components/tasks/TaskForm'

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('due_at', { ascending: true, nullsFirst: false })

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">משימות</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <TaskForm />
      </div>
      <TaskList initialTasks={tasks ?? []} />
    </main>
  )
}
