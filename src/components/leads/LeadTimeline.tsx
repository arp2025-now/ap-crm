import { formatDateTime } from '@/lib/utils'
import type { Meeting, Recording } from '@/lib/supabase/types'

interface LeadTimelineProps {
  meetings: Meeting[]
  recordings: Recording[]
}

export function LeadTimeline({ meetings, recordings }: LeadTimelineProps) {
  // Merge meetings + recordings into a single timeline sorted by date
  type TimelineItem =
    | { type: 'meeting'; date: string; data: Meeting }
    | { type: 'recording'; date: string; data: Recording }

  const items: TimelineItem[] = [
    ...meetings.map(m => ({ type: 'meeting' as const, date: m.scheduled_at, data: m })),
    ...recordings.map(r => ({ type: 'recording' as const, date: r.recorded_at ?? r.created_at, data: r })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (items.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">אין פגישות עדיין</p>
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          {item.type === 'meeting' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  פגישת {item.data.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.data.status === 'התקיימה' ? 'bg-green-50 text-green-600' :
                  item.data.status === 'בוטלה' ? 'bg-red-50 text-red-600' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {item.data.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{formatDateTime(item.data.scheduled_at)}</p>
              {item.data.meet_link && (
                <a href={item.data.meet_link} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 block">
                  לינק לפגישה →
                </a>
              )}
            </>
          )}
          {item.type === 'recording' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  🎙 הקלטה ({item.data.source})
                </span>
                {item.data.recorded_at && (
                  <span className="text-xs text-gray-500">{formatDateTime(item.data.recorded_at)}</span>
                )}
              </div>
              {item.data.title && <p className="text-sm font-medium text-gray-900">{item.data.title}</p>}
              {item.data.summary && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{item.data.summary}</p>
              )}
              {item.data.action_items && (
                <div className="mt-3 bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Action Items</p>
                  <p className="text-xs text-yellow-700 whitespace-pre-line">{item.data.action_items}</p>
                </div>
              )}
              {item.data.transcript && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    תמלול מלא ▸
                  </summary>
                  <p className="text-xs text-gray-600 mt-2 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                    {item.data.transcript}
                  </p>
                </details>
              )}
              {item.data.external_link && (
                <a href={item.data.external_link} target="_blank" className="text-xs text-blue-600 hover:underline mt-2 block">
                  פתח ב-{item.data.source === 'fathom' ? 'Fathom' : 'Fireflies'} →
                </a>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
