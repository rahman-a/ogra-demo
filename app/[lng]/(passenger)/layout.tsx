import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import type { Locale } from '@/i18n/settings'

export default async function PassengerLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lng: string }>
}>) {
  const { lng } = await params as { lng: Locale }
  const session = await auth()
  if (!session) redirect(`/${lng}/auth/signin`)
  if (session && session.user.role !== Role.PASSENGER) redirect(`/${lng}/403`)
  return (
    <>
      {children}
      <Toaster position='top-center' richColors closeButton />
    </>
  )
}
