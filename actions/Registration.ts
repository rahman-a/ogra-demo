'use server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { User } from '@/types'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

export async function registerUser(prevState: any, data: User) {
  try {
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    const { name, password, email, role } = data
    // some user could be created without direct registration (e.g. by admin)
    // or just by entering his data on checkout page
    // the system will create the user but will not register him
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (user) {
      return { response: 'error', message: t('errors.accountAlreadyExists') }
    }

    const hashedPassword = await bcrypt.hash(password!, 10)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    })
    return {
      response: 'success',
      message: t('success.accountCreatedSuccessfully'),
      data: { id: newUser.id },
    }
  } catch (error: any) {
    console.error(error.message)
    if (error) {
      return { response: 'error', message: error.message }
    }
  }
}
