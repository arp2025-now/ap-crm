'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CustomFieldDefinition,
  DbCustomFieldDefinition,
  EntityType,
  FieldOptions,
  FieldType,
  nameToFieldKey,
} from '@/lib/custom-fields/types'

export interface NewFieldInput {
  name: string
  fieldType: FieldType
  options?: FieldOptions
  isRequired?: boolean
}

function dbToDefinition(row: DbCustomFieldDefinition): CustomFieldDefinition {
  return {
    id: row.id,
    entityType: row.entity_type as EntityType,
    name: row.name,
    fieldKey: row.field_key,
    fieldType: row.field_type as FieldType,
    options: (row.options as FieldOptions) ?? {},
    position: row.position,
    isRequired: row.is_required,
    createdAt: row.created_at,
  }
}

export function useCustomFieldDefinitions(entityType: EntityType) {
  const supabase = useRef(createClient()).current
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('entity_type', entityType)
      .order('position', { ascending: true })
    if (error) throw error
    setFields((data as DbCustomFieldDefinition[]).map(dbToDefinition))
    setLoading(false)
  }, [supabase, entityType])

  useEffect(() => { load() }, [load])

  const addField = useCallback(async (input: NewFieldInput) => {
    const nextPosition = fields.length
    const fieldKey = nameToFieldKey(input.name)
    const { error } = await supabase
      .from('custom_field_definitions')
      .insert({
        entity_type: entityType,
        name: input.name,
        field_key: fieldKey,
        field_type: input.fieldType,
        options: input.options ?? {},
        position: nextPosition,
        is_required: input.isRequired ?? false,
      })
    if (error) throw error
    await load()
  }, [supabase, entityType, fields.length, load])

  const updateField = useCallback(async (id: string, changes: Partial<NewFieldInput>) => {
    const update: Record<string, unknown> = {}
    if (changes.name !== undefined) update.name = changes.name
    if (changes.fieldType !== undefined) update.field_type = changes.fieldType
    if (changes.options !== undefined) update.options = changes.options
    if (changes.isRequired !== undefined) update.is_required = changes.isRequired
    const { error } = await supabase
      .from('custom_field_definitions')
      .update(update)
      .eq('id', id)
    if (error) throw error
    await load()
  }, [supabase, load])

  const deleteField = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('custom_field_definitions')
      .delete()
      .eq('id', id)
    if (error) throw error
    setFields(prev => prev.filter(f => f.id !== id))
  }, [supabase])

  const reorderFields = useCallback(async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) => ({ id, position: index }))
    for (const u of updates) {
      const { error } = await supabase
        .from('custom_field_definitions')
        .update({ position: u.position })
        .eq('id', u.id)
      if (error) throw error
    }
    await load()
  }, [supabase, load])

  return { fields, loading, addField, updateField, deleteField, reorderFields }
}
