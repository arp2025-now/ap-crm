'use client'

import { useState, useEffect, useCallback } from 'react'
import type { QuestionnaireSubmission } from '@/lib/types'
import type { DbQuestionnaireSubmission, Json } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

function dbToSubmission(row: DbQuestionnaireSubmission): QuestionnaireSubmission {
  return {
    id: row.id,
    type: row.type as QuestionnaireSubmission['type'],
    leadId: row.lead_id ?? undefined,
    clientId: row.client_id ?? undefined,
    answers: (row.answers as Record<string, string | number | boolean | string[]>) ?? {},
    aiSummary: row.ai_summary ?? undefined,
    submittedAt: row.submitted_at ?? undefined,
    createdAt: row.created_at,
  }
}

export function useQuestionnaires(leadId?: string, clientId?: string) {
  const [submissions, setSubmissions] = useState<QuestionnaireSubmission[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    let q = supabase.from('questionnaire_submissions').select('*').order('created_at', { ascending: false })
    if (leadId) q = q.eq('lead_id', leadId)
    if (clientId) q = q.eq('client_id', clientId)
    const { data } = await q
    if (data) setSubmissions(data.map(dbToSubmission))
  }, [supabase, leadId, clientId])

  useEffect(() => { load() }, [load])

  const addSubmission = useCallback(async (data: Omit<QuestionnaireSubmission, 'id' | 'createdAt'>) => {
    const { data: row, error } = await supabase
      .from('questionnaire_submissions')
      .insert({
        type: data.type,
        lead_id: data.leadId ?? null,
        client_id: data.clientId ?? null,
        answers: data.answers as Json,
        ai_summary: data.aiSummary ?? null,
        submitted_at: data.submittedAt ?? new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    const newSub = dbToSubmission(row)
    setSubmissions((prev) => [newSub, ...prev])
    return newSub
  }, [supabase])

  const deleteSubmission = useCallback(async (id: string) => {
    const { error } = await supabase.from('questionnaire_submissions').delete().eq('id', id)
    if (error) throw error
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
  }, [supabase])

  return { submissions, addSubmission, deleteSubmission, reload: load }
}
