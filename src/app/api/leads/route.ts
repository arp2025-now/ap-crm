import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Validate Make.com webhook secret (optional but recommended)
  const authHeader = request.headers.get('authorization')
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { full_name, phone, email, source, notes, status } = body

  if (!full_name) {
    return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
  }

  // Use service client so Make.com can write without browser session
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('leads')
    .insert({
      full_name,
      phone: phone ?? null,
      email: email ?? null,
      source: source ?? 'אחר',
      notes: notes ?? null,
      status: status ?? 'מתעניין',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
