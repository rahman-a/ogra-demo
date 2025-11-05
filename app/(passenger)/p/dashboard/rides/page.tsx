import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RidesListClient } from '@/components/passenger/RidesListClient'

type Props = {
  searchParams: { page?: string }
}

const ITEMS_PER_PAGE = 10

export default async function AllRidesPage({ searchParams }: Props) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  const currentPage = parseInt(searchParams.page || '1', 10)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch bookings with pagination
  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        passengerId: session.user.id,
        deletedAt: null,
      },
      include: {
        ride: {
          include: {
            route: true,
          },
        },
        seat: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.booking.count({
      where: {
        passengerId: session.user.id,
        deletedAt: null,
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

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
          <h1 className='text-lg font-bold text-gray-800'>All Rides</h1>
          <div className='w-10' /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6'>
        <RidesListClient
          bookings={bookings}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </div>
    </div>
  )
}

