'use client'

import { useWhatsapp } from '@/hooks/use-whatsapp'
import { MessageCircle } from 'lucide-react'

export default function WhatsappPage() {
  const { logs, loading } = useWhatsapp()

  // Group logs by phone number
  const byPhone = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    if (!acc[log.phone]) acc[log.phone] = []
    acc[log.phone].push(log)
    return acc
  }, {})

  const conversations = Object.entries(byPhone).map(([phone, msgs]) => ({
    phone,
    lastMessage: msgs[0],
    count: msgs.length,
  }))

  return (
    <div className="flex h-full" dir="rtl">
      {/* Sidebar — conversation list */}
      <div className="w-80 border-l bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            WhatsApp
          </h1>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">טוען...</div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">אין שיחות עדיין</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div key={conv.phone} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">{conv.phone}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(conv.lastMessage.sentAt).toLocaleDateString('he-IL')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{conv.lastMessage.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">בחרי שיחה מהרשימה</p>
        </div>
      </div>
    </div>
  )
}
