import { Role } from '@prisma/client'

export const ROLES_ROUTES: { [key in Role]: string } = {
  DRIVER: '/d/dashboard',
  PASSENGER: '/p/dashboard',
  ADMIN: '/',
}
