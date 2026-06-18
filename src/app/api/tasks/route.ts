import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, details, due_at, priority, lead_id, client_id, meeting_id } = body

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      details: details ?? null,
      due_at: due_at ?? null,
      priority: priority ?? 'בינוני',
      lead_id: lead_id ?? null,
      client_id: client_id ?? null,
      meeting_id: meeting_id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
