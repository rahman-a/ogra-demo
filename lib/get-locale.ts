import { cookies } from 'next/headers'
import { fallbackLng, type Locale } from '@/i18n/settings'

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get('i18next')?.value
  return (locale === 'ar' || locale === 'en' ? locale : fallbackLng) as Locale
}

