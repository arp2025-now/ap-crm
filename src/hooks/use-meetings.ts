'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Meeting } from '@/lib/types'
import type { DbMeeting } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

// DB stores Hebrew status values; map to English union type
function mapStatus(raw: string): Meeting['status'] {
  if (raw === 'התקיימה') return 'completed'
  if (raw === 'בוטלה') return 'cancelled'
  return 'scheduled'
}

function dbToMeeting(row: DbMeeting): Meeting {
  return {
    id: row.id,
    leadId: row.lead_id ?? undefined,
    clientId: row.client_id ?? undefined,
    type: row.type,
    scheduledAt: row.scheduled_at,
    durationMin: row.duration_min ?? undefined,
    status: mapStatus(row.status),
    meetLink: row.meet_link ?? undefined,
    location: row.location ?? undefined,
    googleEventId: row.google_event_id ?? undefined,
    createdAt: row.created_at,
  }
}

export function useMeetings(leadId?: string, clientId?: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('meetings').select('*')
    if (leadId) query = query.eq('lead_id', leadId)
    else if (clientId) query = query.eq('client_id', clientId)
    const { data } = await query.order('scheduled_at', { ascending: false })
    if (data) setMeetings((data as DbMeeting[]).map(dbToMeeting))
    setLoading(false)
  }, [leadId, clientId, supabase])

  useEffect(() => { load() }, [load])

  return { meetings, loading }
}
