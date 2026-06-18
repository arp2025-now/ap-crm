import { createServerSupabaseClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import type { Lead } from '@/lib/supabase/types'

export default async function PipelinePage() {
  const supabase = await createServerSupabaseClient()
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <a href="/leads/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + ליד חדש
          </button>
        </a>
      </div>
      <KanbanBoard initialLeads={leads as Lead[]} />
    </main>
  )
}
