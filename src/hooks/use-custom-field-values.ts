'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CustomFieldDefinition,
  CustomFieldValueMap,
  DbCustomFieldValue,
  EntityType,
  FieldValue,
} from '@/lib/custom-fields/types'

function rowToValue(row: DbCustomFieldValue, fieldType: string): FieldValue {
  if (fieldType === 'number') return row.value_number
  if (fieldType === 'checkbox') return row.value_boolean
  if (fieldType === 'multi_select') return (row.value_json as string[]) ?? []
  return row.value_text
}

function valueToColumns(value: FieldValue, fieldType: string) {
  if (fieldType === 'number') return { value_number: value as number | null }
  if (fieldType === 'checkbox') return { value_boolean: value as boolean | null }
  if (fieldType === 'multi_select') return { value_json: value }
  return { value_text: value as string | null }
}

export function useCustomFieldValues(entityId: string, entityType: EntityType) {
  const supabase = useRef(createClient()).current
  const [values, setValues] = useState<CustomFieldValueMap>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!entityId) { setLoading(false); return }
    const { data, error } = await supabase
      .from('custom_field_values')
      .select('*, custom_field_definitions(field_key, field_type)')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
    if (error) throw error
    const map: CustomFieldValueMap = {}
    for (const row of (data as (DbCustomFieldValue & {
      custom_field_definitions: { field_key: string; field_type: string }
    })[]) ) {
      const { field_key, field_type } = row.custom_field_definitions
      map[field_key] = rowToValue(row, field_type)
    }
    setValues(map)
    setLoading(false)
  }, [supabase, entityId, entityType])

  useEffect(() => { load() }, [load])

  const setValue = useCallback((fieldKey: string, value: FieldValue) => {
    setValues(prev => ({ ...prev, [fieldKey]: value }))
  }, [])

  const saveAll = useCallback(async (definitions: CustomFieldDefinition[]) => {
    for (const def of definitions) {
      const value = values[def.fieldKey] ?? null
      const columns = valueToColumns(value, def.fieldType)
      const { error } = await supabase
        .from('custom_field_values')
        .upsert({
          entity_id: entityId,
          entity_type: entityType,
          field_def_id: def.id,
          updated_at: new Date().toISOString(),
          ...columns,
        }, { onConflict: 'entity_id,field_def_id' })
      if (error) throw error
    }
  }, [supabase, entityId, entityType, values])

  return { values, loading, setValue, saveAll }
}
