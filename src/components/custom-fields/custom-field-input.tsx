'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CustomFieldDefinition, FieldValue } from '@/lib/custom-fields/types'

interface Props {
  field: CustomFieldDefinition
  value: FieldValue
  onChange: (value: FieldValue) => void
}

export function CustomFieldInput({ field, value, onChange }: Props) {
  const { fieldType, name, options, isRequired } = field

  if (fieldType === 'text' || fieldType === 'phone' || fieldType === 'url') {
    return (
      <Input
        type={fieldType === 'url' ? 'url' : fieldType === 'phone' ? 'tel' : 'text'}
        value={(value as string) ?? ''}
        onChange={e => onChange(e.target.value || null)}
        placeholder={name}
        required={isRequired}
        dir="auto"
      />
    )
  }

  if (fieldType === 'number') {
    return (
      <Input
        type="number"
        value={(value as number) ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={name}
        required={isRequired}
        min={0}
      />
    )
  }

  if (fieldType === 'date') {
    return (
      <Input
        type="date"
        value={(value as string) ?? ''}
        onChange={e => onChange(e.target.value || null)}
        required={isRequired}
      />
    )
  }

  if (fieldType === 'checkbox') {
    return (
      <div className="flex items-center gap-2 h-10">
        <input
          type="checkbox"
          checked={(value as boolean) ?? false}
          onChange={e => onChange(e.target.checked)}
          id={`cf_${field.fieldKey}`}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor={`cf_${field.fieldKey}`} className="text-sm cursor-pointer">
          {name}
        </label>
      </div>
    )
  }

  if (fieldType === 'dropdown') {
    const choices = options.choices ?? []
    return (
      <Select
        value={(value as string) ?? ''}
        onValueChange={v => onChange(v || null)}
        required={isRequired}
      >
        <SelectTrigger>
          <SelectValue placeholder={`בחר ${name}`} />
        </SelectTrigger>
        <SelectContent>
          {choices.map(choice => (
            <SelectItem key={choice} value={choice}>{choice}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (fieldType === 'multi_select') {
    const choices = options.choices ?? []
    const selected = (value as string[]) ?? []
    return (
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10">
        {choices.map(choice => {
          const isSelected = selected.includes(choice)
          return (
            <button
              key={choice}
              type="button"
              onClick={() => {
                const next = isSelected
                  ? selected.filter(s => s !== choice)
                  : [...selected, choice]
                onChange(next.length ? next : null)
              }}
              className={`px-2 py-1 rounded text-sm border transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {choice}
            </button>
          )
        })}
      </div>
    )
  }

  return null
}
