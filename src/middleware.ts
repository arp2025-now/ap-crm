import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from '@/i18n/config'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const PUBLIC_PATHS = ['/login', '/api']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API routes — skip auth and i18n
  if (pathname.startsWith('/api')) return NextResponse.next()

  // Run i18n middleware first to get locale-prefixed URL
  const intlResponse = intlMiddleware(request)

  // Check if route is public (e.g., /he/login)
  const isPublic = PUBLIC_PATHS.some((p) =>
    pathname.includes(p)
  )
  if (isPublic) return intlResponse

  // Check auth
  let supabaseResponse = intlResponse ?? NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value }: any) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Determine locale prefix from pathname
    const locale = locales.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)
      ?? defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
