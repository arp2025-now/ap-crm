'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LeadTimeline } from './LeadTimeline'
import { formatDate } from '@/lib/utils'
import type { Lead, Meeting, Recording, WhatsappLog, Task } from '@/lib/supabase/types'

interface LeadDetailProps {
  lead: Lead
  meetings: Meeting[]
  recordings: Recording[]
  whatsappLogs: WhatsappLog[]
  tasks: Task[]
}

export function LeadDetail({ lead, meetings, recordings, whatsappLogs, tasks }: LeadDetailProps) {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/pipeline" className="text-sm text-gray-500 hover:text-gray-700">
          ← Pipeline
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.full_name}</h1>
            {lead.phone && <p className="text-gray-600 mt-1">{lead.phone}</p>}
            {lead.email && <p className="text-gray-600">{lead.email}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline">{lead.status}</Badge>
            {lead.ai_score && (
              <Badge className={
                lead.ai_score >= 70 ? 'bg-green-100 text-green-700' :
                lead.ai_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }>
                ניקוד: {lead.ai_score}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          {lead.source && <span>מקור: {lead.source}</span>}
          <span>נכנס: {formatDate(lead.created_at)}</span>
        </div>
        {lead.notes && (
          <p className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{lead.notes}</p>
        )}
      </div>

      <Tabs defaultValue="timeline">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">פגישות והקלטות</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp ({whatsappLogs.length})</TabsTrigger>
          <TabsTrigger value="tasks">משימות ({tasks.filter(t => !t.completed_at).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <LeadTimeline meetings={meetings} recordings={recordings} />
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="space-y-3">
            {whatsappLogs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">אין הודעות WhatsApp</p>
            )}
            {whatsappLogs.map(log => (
              <div key={log.id} className={`flex ${log.direction === 'out' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-sm p-3 rounded-lg text-sm ${
                  log.direction === 'out'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <p>{log.message}</p>
                  <p className={`text-xs mt-1 ${log.direction === 'out' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {log.source === 'bot' ? '🤖 ' : ''}{new Date(log.sent_at).toLocaleTimeString('he-IL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-2">
            {tasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">אין משימות</p>
            )}
            {tasks.map(task => (
              <div key={task.id} className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                task.completed_at ? 'border-gray-100 opacity-50' : 'border-gray-200'
              }`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  task.priority === 'גבוה' ? 'bg-red-500' :
                  task.priority === 'בינוני' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.completed_at ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  {task.due_at && (
                    <p className="text-xs text-gray-500 mt-0.5">עד: {formatDate(task.due_at)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
