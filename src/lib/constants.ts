export const PIPELINE_STAGES = [
  'מתעניין',
  'שיחת היכרות',
  'שיחת אפיון',
  'הצעת מחיר',
  'הצעת מחיר חתומה',
  'לקוח',
] as const

export type PipelineStage = typeof PIPELINE_STAGES[number]

export const LEAD_SOURCES = [
  'אתר',
  'אינסטגרם',
  'פייסבוק',
  'המלצה',
  'לינקדאין',
  'ידני',
  'אחר',
] as const

export const TASK_PRIORITIES = ['גבוה', 'בינוני', 'נמוך'] as const
export type TaskPriority = typeof TASK_PRIORITIES[number]
