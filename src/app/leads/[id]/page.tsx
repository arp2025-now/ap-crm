import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LeadDetail } from '@/components/leads/LeadDetail'

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [leadRes, meetingsRes, recordingsRes, waRes, tasksRes] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('meetings').select('*').eq('lead_id', id).order('scheduled_at', { ascending: false }),
    supabase.from('recordings').select('*').eq('lead_id', id).order('recorded_at', { ascending: false }),
    supabase.from('whatsapp_logs').select('*').eq('lead_id', id).order('sent_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
  ])

  if (leadRes.error || !leadRes.data) notFound()

  return (
    <LeadDetail
      lead={leadRes.data}
      meetings={meetingsRes.data ?? []}
      recordings={recordingsRes.data ?? []}
      whatsappLogs={waRes.data ?? []}
      tasks={tasksRes.data ?? []}
    />
  )
}
