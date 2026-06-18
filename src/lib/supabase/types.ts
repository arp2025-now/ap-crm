export type PipelineStage =
  | 'מתעניין'
  | 'שיחת היכרות'
  | 'שיחת אפיון'
  | 'הצעת מחיר'
  | 'הצעת מחיר חתומה'
  | 'לקוח'

export interface Lead {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  source: string | null
  status: PipelineStage
  ai_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  lead_id: string | null
  full_name: string
  phone: string | null
  email: string | null
  company: string | null
  created_at: string
}

export interface Meeting {
  id: string
  lead_id: string | null
  client_id: string | null
  type: 'היכרות' | 'אפיון' | 'פולואפ' | 'אחר'
  scheduled_at: string
  duration_min: number | null
  status: 'מתוכננת' | 'התקיימה' | 'בוטלה'
  google_event_id: string | null
  meet_link: string | null
  location: string | null
  created_at: string
}

export interface Recording {
  id: string
  meeting_id: string | null
  lead_id: string | null
  client_id: string | null
  source: 'fathom' | 'fireflies'
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

export interface Task {
  id: string
  title: string
  details: string | null
  due_at: string | null
  completed_at: string | null
  assigned_to: string | null
  priority: 'גבוה' | 'בינוני' | 'נמוך'
  lead_id: string | null
  client_id: string | null
  meeting_id: string | null
  project_id: string | null
  created_at: string
}

export interface WhatsappLog {
  id: string
  lead_id: string | null
  client_id: string | null
  phone: string
  direction: 'in' | 'out'
  message: string
  source: 'bot' | 'manual'
  sent_at: string
}

export interface Partnership {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  type: string | null
  notes: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
      meetings: {
        Row: Meeting
        Insert: Omit<Meeting, 'id' | 'created_at'>
        Update: Partial<Omit<Meeting, 'id' | 'created_at'>>
      }
      recordings: {
        Row: Recording
        Insert: Omit<Recording, 'id' | 'created_at'>
        Update: Partial<Omit<Recording, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
      whatsapp_logs: {
        Row: WhatsappLog
        Insert: Omit<WhatsappLog, 'id' | 'sent_at'>
        Update: Partial<Omit<WhatsappLog, 'id' | 'sent_at'>>
      }
      partnerships: {
        Row: Partnership
        Insert: Omit<Partnership, 'id' | 'created_at'>
        Update: Partial<Omit<Partnership, 'id' | 'created_at'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
