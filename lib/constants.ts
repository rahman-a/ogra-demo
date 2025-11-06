import { Role } from '@prisma/client'
import type { Locale } from '@/i18n/settings'

export const ROLES_ROUTES: { [key in Role]: string } = {
  DRIVER: '/d/dashboard',
  PASSENGER: '/p/dashboard',
  ADMIN: '/',
}

export const getLocalizedRoleRoute = (role: Role, locale: Locale): string => {
  const route = ROLES_ROUTES[role]
  return `/${locale}${route}`
}
