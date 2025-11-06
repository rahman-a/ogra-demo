'use client'

import { usePathname, useRouter } from 'next/navigation'
import { languages, type Locale } from '@/i18n/settings'
import { useTranslation } from '@/i18n/client'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

interface LanguageSwitcherProps {
  lng: Locale
}

export function LanguageSwitcher({ lng }: LanguageSwitcherProps) {
  const { t } = useTranslation(lng, 'common')
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLng: Locale) => {
    if (!pathname) return
    
    const segments = pathname.split('/')
    segments[1] = newLng
    const newPath = segments.join('/')
    
    router.push(newPath)
    
    // Set cookie for language preference
    document.cookie = `i18next=${newLng};path=/;max-age=31536000`
  }

  const getLanguageLabel = (locale: Locale) => {
    const labels: Record<Locale, string> = {
      en: t('english'),
      ar: t('arabic'),
    }
    return labels[locale] || locale
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className='h-9 gap-2'>
            <Globe className='h-4 w-4' />
            <span className='hidden sm:inline'>{getLanguageLabel(lng)}</span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className='flex flex-col gap-1 p-2 w-[160px]'>
              {languages.map((locale) => (
                <Button
                  key={locale}
                  variant={lng === locale ? 'default' : 'ghost'}
                  className='w-full justify-start'
                  onClick={() => switchLanguage(locale)}
                >
                  {getLanguageLabel(locale)}
                </Button>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

