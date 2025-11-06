'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { languages, type Locale } from '@/i18n/settings'
import { Button } from '@/components/ui/button'

interface SimpleLanguageSwitcherProps {
  lng: Locale
}

export function SimpleLanguageSwitcher({ lng }: SimpleLanguageSwitcherProps) {
  const pathname = usePathname()

  const getLocalizedPath = (newLng: Locale) => {
    if (!pathname) return `/${newLng}`
    const segments = pathname.split('/')
    segments[1] = newLng
    return segments.join('/')
  }

  return (
    <div className='flex items-center gap-2'>
      {languages.map((locale) => (
        <Link key={locale} href={getLocalizedPath(locale)}>
          <Button
            variant={lng === locale ? 'default' : 'ghost'}
            size='sm'
            className='uppercase font-bold'
          >
            {locale}
          </Button>
        </Link>
      ))}
    </div>
  )
}

