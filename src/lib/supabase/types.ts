export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type DbLead = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  source: string | null
  status: string
  ai_score: number | null
  notes: string | null
  company: string | null
  heat_level: string | null
  pipeline_value: number | null
  created_at: string
  updated_at: string
}

export type DbClient = {
  id: string
  lead_id: string | null
  full_name: string
  phone: string | null
  email: string | null
  company: string | null
  industry: string | null
  assigned_agent_id: string | null
  tags: string[] | null
  sentiment_score: number | null
  lifetime_value: number | null
  health_grade: string | null
  lifecycle_stage: string | null
  created_at: string
}

export type DbTask = {
  id: string
  title: string
  details: string | null
  due_at: string | null
  completed_at: string | null
  status: string
  assigned_to: string | null
  priority: string
  lead_id: string | null
  client_id: string | null
  meeting_id: string | null
  project_id: string | null
  created_at: string
  updated_at: string | null
}

export type DbMeeting = {
  id: string
  lead_id: string | null
  client_id: string | null
  type: string
  scheduled_at: string
  duration_min: number | null
  status: string
  meet_link: string | null
  location: string | null
  google_event_id: string | null
  created_at: string
}

export type DbRecording = {
  id: string
  meeting_id: string | null
  lead_id: string | null
  client_id: string | null
  source: string
  external_id: string | null
  external_link: string | null
  title: string | null
  summary: string | null
  transcript: string | null
  action_items: string | null
  participants: string | null
  duration_min: number | null
  recorded_at: string | null
  created_at: string
}

export type DbWhatsappLog = {
  id: string
  lead_id: string | null
  client_id: string | null
  phone: string
  direction: string
  message: string
  sent_at: string
  source: string
}

export type DbPipelineStage = {
  id: string
  name: string
  position: number
  color: string | null
  created_at: string
}

export type DbAutomation = {
  id: string
  name: string
  active: boolean
  trigger: string
  trigger_config: Json
  steps: Json
  run_count: number
  last_run_at: string | null
  created_at: string
  updated_at: string
}

// Backward-compat aliases — existing imports continue to work
// while migrations to Db* names happen incrementally in later tasks.
export type Lead = DbLead
export type Meeting = DbMeeting
export type Recording = DbRecording
export type Task = DbTask
export type WhatsappLog = DbWhatsappLog
