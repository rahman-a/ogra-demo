import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PassengerProfileForm } from '@/components/passenger/PassengerProfileForm'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function PassengerProfile({ params }: Props) {
  const session = await auth()
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'dashboard')

  if (!session || !session.user) {
    redirect(`/${lng}/auth/signin`)
  }

  // Fetch user profile data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      dateOfBirth: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect(`/${lng}/auth/signin`)
  }

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white pb-20'>
      {/* Header */}
      <div className='bg-white shadow-sm sticky top-0 z-30'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <Link href={`/${lng}/p/dashboard`}>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6 ltr:block rtl:hidden' />
              <ArrowRight className='w-6 h-6 ltr:hidden rtl:block' />
            </Button>
          </Link>
          <h1 className='text-lg font-bold text-gray-800'>
            {t('profile.title')}
          </h1>
          <div className='w-10' /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6'>
        <PassengerProfileForm user={user} lng={lng} />
      </div>
    </div>
  )
}
