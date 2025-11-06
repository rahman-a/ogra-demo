import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Navigation,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SeatsDiagram } from './SeatsDiagram'
import { ReloadButton } from './ReloadButton'
import { completeRide } from '@/actions/CompleteRide'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function ActiveRidePage({ params }: Props) {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'dashboard')
  const session = await auth()

  if (!session || !session.user) {
    redirect(`/${lng}/auth/signin`)
  }

  // Fetch user's vehicle with route and active ride
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      route: {
        include: {
          rides: {
            where: {
              status: 'ACTIVE',
              deletedAt: null,
            },
            include: {
              bookings: {
                where: {
                  status: 'CONFIRMED',
                },
                select: {
                  id: true,
                  passengerId: true,
                  seatId: true,
                  totalPrice: true,
                  status: true,
                  passenger: {
                    select: {
                      name: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      seats: {
        orderBy: {
          seatNumber: 'asc',
        },
      },
    },
  })

  // If no vehicle or no active ride, redirect to dashboard
  if (!vehicle || !vehicle.route || vehicle.route.rides.length === 0) {
    redirect(`/${lng}/d/dashboard`)
  }

  const activeRide = vehicle.route.rides[0]
  const bookedSeatsCount = vehicle.capacity - activeRide.availableSeats

  // Filter out manual bookings (where passenger is the driver)
  const appBookings = activeRide.bookings.filter(
    (booking) => booking.passengerId !== session.user.id
  )

  // Total earnings only from app bookings (cash payments already received by driver)
  const totalEarnings = appBookings.length * vehicle.route.pricePerSeat
  const cashBookingsCount = bookedSeatsCount - appBookings.length

  // Calculate ride duration
  const rideStartTime = new Date(activeRide.departureTime)
  const now = new Date()
  const durationMinutes = Math.floor(
    (now.getTime() - rideStartTime.getTime()) / 1000 / 60
  )

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white pb-20'>
      {/* Header */}
      <div className='bg-white shadow-sm sticky top-0 z-30'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <Link href={`/${lng}/d/dashboard`}>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6 ltr:block rtl:hidden' />
              <ArrowRight className='w-6 h-6 ltr:hidden rtl:block' />
            </Button>
          </Link>
          <h1 className='text-lg font-bold text-gray-800'>
            {t('activeRide.title')}
          </h1>
          <div className='w-10' /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Stats Bar - Thin Green Bar */}
      <div className='bg-linear-to-r from-green-500 to-green-600 text-white shadow-md'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {/* Route */}
            <div className='flex items-center gap-2'>
              <div className='bg-white/20 rounded-lg p-2'>
                <Navigation
                  className={`w-5 h-5 ${
                    activeRide.direction === 'FORWARD' ? '' : 'rotate-180'
                  }`}
                />
              </div>
              <div>
                <p className='text-xs opacity-90'>
                  {t('activeRide.stats.route')}
                </p>
                <p className='font-bold text-sm'>
                  {activeRide.direction === 'FORWARD'
                    ? `${vehicle.route.origin} → ${vehicle.route.destination}`
                    : `${vehicle.route.destination} → ${vehicle.route.origin}`}
                </p>
              </div>
            </div>

            {/* Booked Seats */}
            <div className='flex items-center gap-2'>
              <div className='bg-white/20 rounded-lg p-2'>
                <Users className='w-5 h-5' />
              </div>
              <div>
                <p className='text-xs opacity-90'>
                  {t('activeRide.stats.booked')}
                </p>
                <p className='font-bold text-lg'>
                  {bookedSeatsCount}/{vehicle.capacity - 1}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className='flex items-center gap-2'>
              <div className='bg-white/20 rounded-lg p-2'>
                <Clock className='w-5 h-5' />
              </div>
              <div>
                <p className='text-xs opacity-90'>
                  {t('activeRide.stats.duration')}
                </p>
                <p className='font-bold text-sm'>
                  {durationMinutes} {t('activeRide.stats.minutes')}
                </p>
              </div>
            </div>

            {/* Earnings */}
            <div className='flex items-center gap-2'>
              <div className='bg-white/20 rounded-lg p-2'>
                <TrendingUp className='w-5 h-5' />
              </div>
              <div>
                <p className='text-xs opacity-90'>
                  {t('activeRide.stats.appEarnings')}
                </p>
                <p className='font-bold text-lg'>
                  {lng === 'ar'
                    ? `${totalEarnings.toFixed(0)} ${t('currency.symbol')}`
                    : `${t('currency.symbol')}${totalEarnings.toFixed(0)}`}
                </p>
                {cashBookingsCount > 0 && (
                  <p className='text-[10px] opacity-75'>
                    {lng === 'ar' ? '+' : ''}
                    {lng === 'ar'
                      ? `${(
                          cashBookingsCount * vehicle.route.pricePerSeat
                        ).toFixed(0)} ${t('currency.symbol')}`
                      : `+${t('currency.symbol')}${(
                          cashBookingsCount * vehicle.route.pricePerSeat
                        ).toFixed(0)}`}{' '}
                    {t('activeRide.stats.cash')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6'>
        {/* Seats Diagram */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-gray-800'>
              {t('activeRide.seatsOverview')}
            </h2>
            <ReloadButton lng={lng} />
          </div>
          <SeatsDiagram
            seats={vehicle.seats}
            bookings={activeRide.bookings}
            capacity={vehicle.capacity}
            rideId={activeRide.id}
            pricePerSeat={vehicle.route.pricePerSeat}
            lng={lng}
          />
        </div>

        {/* Passengers List - App Bookings Only */}
        {appBookings.length > 0 && (
          <div className='mb-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-4'>
              {t('activeRide.appPassengers', { count: appBookings.length })}
            </h2>
            <div className='bg-white rounded-2xl shadow-lg p-4 space-y-3'>
              {appBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div className='bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-800'>
                        {booking.passenger.name}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {booking.passenger.phone || booking.passenger.email}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-green-600'>
                      {lng === 'ar'
                        ? `${booking.totalPrice} ${t('currency.symbol')}`
                        : `${t('currency.symbol')}${booking.totalPrice}`}
                    </p>
                    {booking.seatId && (
                      <p className='text-xs text-gray-500'>
                        {t('activeRide.seatLabel')}:{' '}
                        {
                          vehicle.seats.find((s) => s.id === booking.seatId)
                            ?.seatNumber
                        }
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Bookings Info */}
        {cashBookingsCount > 0 && (
          <div className='mb-6'>
            <div className='bg-blue-50 border-2 border-blue-200 rounded-2xl p-4'>
              <div className='text-center'>
                <p className='text-sm text-blue-800 mb-1'>
                  <span className='font-bold'>💵 {cashBookingsCount}</span>{' '}
                  {t('activeRide.cashBookings', { count: cashBookingsCount })}
                </p>
                <p className='text-xs text-blue-600'>
                  {t('activeRide.cashReceived', {
                    amount:
                      lng === 'ar'
                        ? `${(
                            cashBookingsCount * vehicle.route.pricePerSeat
                          ).toFixed(2)} ${t('currency.symbol')}`
                        : `${t('currency.symbol')}${(
                            cashBookingsCount * vehicle.route.pricePerSeat
                          ).toFixed(2)}`,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Complete Ride Button */}
        <div className='sticky bottom-4 z-50'>
          <form action={completeRide}>
            <input type='hidden' name='rideId' value={activeRide.id} />
            <Button
              type='submit'
              className='w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg flex items-center justify-center gap-2'
            >
              <CheckCircle className='w-6 h-6' />
              {totalEarnings > 0
                ? t('activeRide.completeRideWithEarnings', {
                    amount:
                      lng === 'ar'
                        ? `${totalEarnings.toFixed(0)} ${t('currency.symbol')}`
                        : `${t('currency.symbol')}${totalEarnings.toFixed(0)}`,
                  })
                : t('activeRide.completeRide')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
