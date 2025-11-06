import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/layout/navbar'
import { languages, type Locale } from '@/i18n/settings'
import { Geist, Geist_Mono } from 'next/font/google'
import { dir } from 'i18next'

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lng: string }>
}>) {
  const { lng } = (await params) as { lng: Locale }

  return (
    <html lang={lng} dir={dir(lng)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar lng={lng} />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
