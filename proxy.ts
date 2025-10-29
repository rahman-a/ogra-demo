import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const proxy = auth((req) => {
  const isServerAction =
    req.headers.has('next-action') || req.headers.has('x-action')

  if (isServerAction) {
    return NextResponse.next()
  }
  const headers = new Headers(req.headers)
  headers.set('x-current-path', req.nextUrl.pathname)
  return NextResponse.next({ headers })
})

export { proxy }
