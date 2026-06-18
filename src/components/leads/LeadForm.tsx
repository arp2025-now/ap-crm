'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEAD_SOURCES } from '@/lib/constants'

export function LeadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const body = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      source: formData.get('source') as string || null,
      notes: formData.get('notes') as string || null,
    }

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      setError('שגיאה ביצירת הליד')
      setLoading(false)
      return
    }

    const lead = await res.json()
    router.push(`/leads/${lead.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">שם מלא *</Label>
        <Input id="full_name" name="full_name" required autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">טלפון</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <div className="space-y-2">
        <Label>מקור הגעה</Label>
        <Select name="source">
          <SelectTrigger>
            <SelectValue placeholder="בחרי מקור" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_SOURCES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">הערות</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'שומר...' : 'צור ליד'}
      </Button>
    </form>
  )
}
