import { Role } from '@prisma/client'

export interface User {
  name: string
  email: string
  role: Role
  password?: string
}
