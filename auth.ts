import NextAuth, { CredentialsSignin, DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { cookies } from 'next/headers'
import { getTranslation } from './i18n'
import { fallbackLng, type Locale } from './i18n/settings'

declare module 'next-auth' {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string
    email: string
    name: string
    role: Role
  }
  interface Session {
    user: User & DefaultSession['user']
  }
}

class InvalidLoginError extends CredentialsSignin {
  constructor(message?: string) {
    super()
    this.code = message || 'Invalid identifier or password'
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Get locale from cookies for translation
        const cookieStore = await cookies()
        const locale = (cookieStore.get('i18next')?.value ||
          fallbackLng) as Locale
        const { t } = await getTranslation(locale, 'auth')

        const { email, password } = credentials as {
          email: string
          password: string
        }
        if (!email || !password)
          throw new InvalidLoginError(t('signin.invalidCredentials'))
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new InvalidLoginError(t('signin.invalidCredentials'))
        const isMatch = await bcrypt.compare(password as string, user.password)
        if (!isMatch)
          throw new InvalidLoginError(t('signin.invalidCredentials'))
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role as Role,
          id: token.id as string,
        },
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.AUTH_SECRET,
})
