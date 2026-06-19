'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Recording } from '@/lib/types'
import type { DbRecording } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

function dbToRecording(row: DbRecording): Recording {
  return {
    id: row.id,
    meetingId: row.meeting_id ?? undefined,
    leadId: row.lead_id ?? undefined,
    clientId: row.client_id ?? undefined,
    source: row.source,
    externalId: row.external_id ?? undefined,
    externalLink: row.external_link ?? undefined,
    title: row.title ?? undefined,
    summary: row.summary ?? undefined,
    transcript: row.transcript ?? undefined,
    actionItems: row.action_items ?? undefined,
    participants: row.participants ?? undefined,
    durationMin: row.duration_min ?? undefined,
    recordedAt: row.recorded_at ?? row.created_at,
  }
}

export function useRecordings(leadId?: string, clientId?: string) {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('recordings').select('*')
    if (leadId) query = query.eq('lead_id', leadId)
    else if (clientId) query = query.eq('client_id', clientId)
    const { data } = await query.order('recorded_at', { ascending: false })
    if (data) setRecordings((data as DbRecording[]).map(dbToRecording))
    setLoading(false)
  }, [leadId, clientId, supabase])

  useEffect(() => { load() }, [load])

  return { recordings, loading }
}
