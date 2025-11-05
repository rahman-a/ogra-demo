import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PassengerProfileForm } from '@/components/passenger/PassengerProfileForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = object

export default async function PassengerProfile({}: Props) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
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
    redirect('/auth/signin')
  }

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white pb-20'>
      {/* Header */}
      <div className='bg-white shadow-sm sticky top-0 z-30'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <Link href='/p/dashboard'>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6' />
            </Button>
          </Link>
          <h1 className='text-lg font-bold text-gray-800'>Profile</h1>
          <div className='w-10' /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6'>
        <PassengerProfileForm user={user} />
      </div>
    </div>
  )
}
