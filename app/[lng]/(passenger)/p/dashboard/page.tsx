import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PassengerDashboardClient } from '@/components/passenger/PassengerDashboardClient'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function PassengerDashboard({ params }: Props) {
  const session = await auth()
  const { lng } = (await params) as { lng: Locale }

  if (!session || !session.user) {
    redirect(`/${lng}/auth/signin`)
  }

  // Fetch user's previous bookings and wallet
  const [bookings, wallet] = await Promise.all([
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
      take: 10,
    }),
    prisma.wallet.findUnique({
      where: {
        userId: session.user.id,
      },
    }),
  ])

  return (
    <PassengerDashboardClient
      bookings={bookings}
      walletBalance={wallet?.balance || 0}
      lng={lng}
    />
  )
}
