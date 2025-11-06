import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { languages, type Locale } from '@/i18n/settings'
import { dir } from 'i18next'

export const metadata: Metadata = {
  title: 'Ogra - Transport Solution',
  description: 'Modern transport booking and management system',
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
  // The proxy.ts handles locale detection and redirection
  // This layout just wraps the [lng] dynamic route
  return (
    <html lang={lng} dir={dir(lng)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
