import { auth } from '@/auth'
import { ROLES_ROUTES } from '@/lib/constants'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  console.log('Auth Layout: ', session?.user.role)
  if (session && session.user.role) redirect(ROLES_ROUTES[session.user.role])
  return children
}
