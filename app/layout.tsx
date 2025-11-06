import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ogra - Transport Solution',
  description: 'Modern transport booking and management system',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // The proxy.ts handles locale detection and redirection
  // This layout just wraps the [lng] dynamic route
  return children
}
