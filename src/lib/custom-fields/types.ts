export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'dropdown'
  | 'multi_select'
  | 'phone'
  | 'url'
  | 'file'

export type EntityType =
  | 'lead'
  | 'customer'
  | 'task'
  | 'meeting'
  | 'recording'
  | 'whatsapp'

export interface FieldOptions {
  choices?: string[]       // for dropdown + multi_select
  accept?: string          // for file, e.g. "image/*"
  maxSizeMb?: number       // for file
}

export interface CustomFieldDefinition {
  id: string
  entityType: EntityType
  name: string
  fieldKey: string
  fieldType: FieldType
  options: FieldOptions
  position: number
  isRequired: boolean
  createdAt: string
}

export type FieldValue = string | number | boolean | string[] | null

export interface CustomFieldValueMap {
  [fieldKey: string]: FieldValue
}

// DB row types
export interface DbCustomFieldDefinition {
  id: string
  entity_type: string
  name: string
  field_key: string
  field_type: string
  options: Record<string, unknown>
  position: number
  is_required: boolean
  created_at: string
}

export interface DbCustomFieldValue {
  id: string
  entity_id: string
  entity_type: string
  field_def_id: string
  value_text: string | null
  value_number: number | null
  value_boolean: boolean | null
  value_json: unknown
  created_at: string
  updated_at: string
}

// Utility: generate field_key from Hebrew/English name
export function nameToFieldKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s֐-׿]+/g, '_')  // spaces and Hebrew chars → _
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    || `field_${Date.now()}`
}
