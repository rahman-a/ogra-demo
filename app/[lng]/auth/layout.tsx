import { auth } from '@/auth'
import { getLocalizedRoleRoute } from '@/lib/constants'
import { redirect } from 'next/navigation'
import type { Locale } from '@/i18n/settings'

export default async function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lng: string }>
}>) {
  const { lng } = await params as { lng: Locale }
  const session = await auth()
  console.log('Auth Layout: ', session?.user.role)
  if (session && session.user.role) {
    redirect(getLocalizedRoleRoute(session.user.role, lng))
  }
  return children
}
