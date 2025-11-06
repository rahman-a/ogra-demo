export const fallbackLng = 'en'
export const languages = ['en', 'ar'] as const
export const defaultNS = 'common'

export type Locale = (typeof languages)[number]

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  }
}

