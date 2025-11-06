import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import type { Locale } from '@/i18n/settings'

export default async function DriverLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lng: string }>
}>) {
  const { lng } = await params as { lng: Locale }
  const session = await auth()
  console.log('Driver Layout: ', session?.user.role)
  if (!session) redirect(`/${lng}/auth/signin`)
  if (session && session.user.role !== Role.DRIVER) redirect(`/${lng}/403`)
  return children
}
