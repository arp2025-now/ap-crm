'use client'

import { useState, useEffect } from 'react'
import type { WhatsappLog } from '@/lib/types'
import type { DbWhatsappLog } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

function dbToLog(row: DbWhatsappLog): WhatsappLog {
  return {
    id: row.id,
    leadId: row.lead_id ?? undefined,
    clientId: row.client_id ?? undefined,
    phone: row.phone,
    direction: row.direction as WhatsappLog['direction'],
    message: row.message,
    sentAt: row.sent_at,
    source: row.source as WhatsappLog['source'],
  }
}

export function useWhatsapp(leadId?: string, clientId?: string) {
  const [logs, setLogs] = useState<WhatsappLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      let query = supabase.from('whatsapp_logs').select('*')
      if (leadId) query = query.eq('lead_id', leadId)
      else if (clientId) query = query.eq('client_id', clientId)
      const { data } = await query.order('sent_at', { ascending: false })
      if (data) setLogs(data.map(dbToLog))
      setLoading(false)
    }
    load()
  }, [leadId, clientId, supabase])

  return { logs, loading }
}
