import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages } from './i18n/settings'

acceptLanguage.languages(languages as unknown as string[])

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
}

const cookieName = 'i18next'

const proxy = auth((req: NextRequest) => {
  // Check if it's a server action
  const isServerAction =
    req.headers.has('next-action') || req.headers.has('x-action')

  if (isServerAction) {
    return NextResponse.next()
  }

  // Language detection
  let lng: string | undefined | null

  if (req.cookies.has(cookieName)) {
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value)
  }

  if (!lng) {
    lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  }

  if (!lng) {
    lng = fallbackLng
  }

  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
    )
  }

  // Set language cookie from referer if available
  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer') || '')
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`)
    )

    // Create headers with current path
    const headers = new Headers(req.headers)
    headers.set('x-current-path', req.nextUrl.pathname)

    const response = NextResponse.next({ headers })

    if (lngInReferer) {
      response.cookies.set(cookieName, lngInReferer)
    }

    return response
  }

  // Set current path header for all other requests
  const headers = new Headers(req.headers)
  headers.set('x-current-path', req.nextUrl.pathname)
  return NextResponse.next({ headers })
})

export { proxy }
