'use client'

import { Suspense, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBranding } from '@/hooks/use-branding'

function LoginForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('אימייל או סיסמה שגויים')
      return
    }
    const redirectTo = searchParams.get('redirectTo')
    router.push(redirectTo ?? `/${locale}/pipeline`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {loading ? 'מתחבר...' : 'התחברי'}
      </button>
    </form>
  )
}

function LoginContent({ locale }: { locale: string }) {
  const { branding } = useBranding()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* Logo + name */}
        <div className="flex flex-col items-center gap-3 pb-2">
          {branding.logoDataUrl ? (
            <img src={branding.logoDataUrl} alt={branding.companyName} className="h-12 w-12 object-contain" />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
              {branding.companyName.charAt(0)}
            </div>
          )}
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">{branding.companyName}</h1>
            <p className="text-gray-400 text-sm mt-0.5">התחברי למערכת</p>
          </div>
        </div>

        <Suspense fallback={<div className="text-sm text-gray-400">טוען...</div>}>
          <LoginForm locale={locale} />
        </Suspense>
      </div>
    </div>
  )
}

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  return <LoginContent locale={locale} />
}
