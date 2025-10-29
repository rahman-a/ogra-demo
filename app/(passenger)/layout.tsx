import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'

export default async function PassengerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  if (!session) redirect('/auth/signin')
  if (session && session.user.role !== Role.PASSENGER) redirect('/403')
  return children
}
