'use client'

import { CustomFieldDefinition, CustomFieldValueMap, EntityType, FieldValue } from '@/lib/custom-fields/types'
import { CustomFieldInput } from './custom-field-input'

interface Props {
  entityType: EntityType
  definitions: CustomFieldDefinition[]
  values: CustomFieldValueMap
  onChangeValue: (fieldKey: string, value: FieldValue) => void
}

export function CustomFieldsSection({ definitions, values, onChangeValue }: Props) {
  if (definitions.length === 0) return null

  return (
    <div className="space-y-3 pt-2 border-t">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">שדות נוספים</p>
      {definitions.map(field => (
        <div key={field.id} className="space-y-1">
          {field.fieldType !== 'checkbox' && (
            <label className="text-sm font-medium text-gray-700">
              {field.name}
              {field.isRequired && <span className="text-red-500 mr-1">*</span>}
            </label>
          )}
          <CustomFieldInput
            field={field}
            value={values[field.fieldKey] ?? null}
            onChange={v => onChangeValue(field.fieldKey, v)}
          />
        </div>
      ))}
    </div>
  )
}
