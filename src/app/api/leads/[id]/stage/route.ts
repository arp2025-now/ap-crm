import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status } = body as { status?: string }
  if (!status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Validate stage exists
  const { data: stage } = await supabase
    .from('pipeline_stages')
    .select('name')
    .eq('name', status)
    .single()

  if (!stage) {
    return NextResponse.json({ error: `Invalid stage: ${status}` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
