import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'

export default async function DriverLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  console.log('Driver Layout: ', session?.user.role)
  if (!session) redirect('/auth/signin')
  if (session && session.user.role !== Role.DRIVER) redirect('/403')
  return children
}
