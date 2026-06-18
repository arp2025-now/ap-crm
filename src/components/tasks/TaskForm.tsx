'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TASK_PRIORITIES } from '@/lib/constants'

interface TaskFormProps {
  leadId?: string
  clientId?: string
  meetingId?: string
  onSuccess?: () => void
}

export function TaskForm({ leadId, clientId, meetingId, onSuccess }: TaskFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title') as string,
        details: formData.get('details') as string || null,
        due_at: formData.get('due_at') as string || null,
        priority: formData.get('priority') as string,
        lead_id: leadId ?? null,
        client_id: clientId ?? null,
        meeting_id: meetingId ?? null,
      }),
    })

    setLoading(false)
    ;(e.target as HTMLFormElement).reset()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="title">משימה *</Label>
        <Input id="title" name="title" required placeholder="מה צריך לעשות?" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="due_at">תאריך יעד</Label>
          <Input id="due_at" name="due_at" type="date" />
        </div>
        <div>
          <Label>עדיפות</Label>
          <Select name="priority" defaultValue="בינוני">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="details">פרטים</Label>
        <Textarea id="details" name="details" rows={2} />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? 'שומר...' : '+ הוסף משימה'}
      </Button>
    </form>
  )
}
