import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/layout/navbar'
import { languages, type Locale } from '@/i18n/settings'

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lng: string }>
}>) {
  const { lng } = (await params) as { lng: Locale }

  return (
    <>
      <Navbar lng={lng} />
      <SessionProvider>{children}</SessionProvider>
    </>
  )
}
