'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

export async function assignSeat(formData: FormData) {
  const lng = await getLocaleFromCookies()
  const { t } = await getTranslation(lng, 'actions')
  const session = await auth()

  if (!session || !session.user) {
    throw new Error(t('errors.mustBeLoggedIn'))
  }

  const bookingId = formData.get('bookingId') as string
  const seatId = formData.get('seatId') as string

  if (!bookingId || !seatId) {
    throw new Error(t('errors.bookingIdAndSeatIdRequired'))
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get the booking
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: {
            include: {
              route: {
                include: {
                  vehicle: true,
                },
              },
            },
          },
        },
      })

      if (!booking) {
        throw new Error(t('errors.bookingNotFound'))
      }

      // Check if booking already has a seat
      if (booking.seatId) {
        throw new Error(t('errors.bookingAlreadyHasSeat'))
      }

      // Check if booking is cancelled or completed
      if (booking.status === 'CANCELLED') {
        throw new Error(t('errors.cannotAssignSeatToCancelledBooking'))
      }

      if (booking.status === 'COMPLETED') {
        throw new Error(t('errors.cannotAssignSeatToCompletedBooking'))
      }

      // Get the seat and verify it belongs to the vehicle for this ride
      const seat = await tx.seat.findUnique({
        where: { id: seatId },
      })

      if (!seat) {
        throw new Error(t('errors.seatNotFound'))
      }

      // Verify seat belongs to the correct vehicle
      if (seat.vehicleId !== booking.ride.route.vehicle.id) {
        throw new Error(t('errors.seatDoesNotBelongToVehicle'))
      }

      // Check if seat is available
      if (seat.status !== 'AVAILABLE') {
        throw new Error(
          t('errors.seatNotAvailableStatus', {
            status: seat.status.toLowerCase(),
          })
        )
      }

      // Check if seat is already booked for this ride
      const existingBooking = await tx.booking.findFirst({
        where: {
          rideId: booking.rideId,
          seatId: seatId,
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
      })

      if (existingBooking) {
        throw new Error(t('errors.thisSeatAlreadyBooked'))
      }

      // Assign the seat to the booking
      await tx.booking.update({
        where: { id: bookingId },
        data: { seatId },
      })

      // Update seat status to occupied
      await tx.seat.update({
        where: { id: seatId },
        data: { status: 'OCCUPIED' },
      })
    })

    revalidatePath('/d/dashboard')
    revalidatePath('/p/dashboard')
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return { success: true, message: t('success.seatAssignedSuccessfully') }
  } catch (error) {
    console.error('Assign seat error:', error)
    throw error
  }
}
