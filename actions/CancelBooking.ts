'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function cancelBooking(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('You must be logged in')
  }

  const bookingId = formData.get('bookingId') as string

  if (!bookingId) {
    throw new Error('Booking ID is required')
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get the booking
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: true,
          seat: true,
        },
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Check if user owns this booking
      if (booking.passengerId !== session.user.id) {
        throw new Error('You can only cancel your own bookings')
      }

      // Check if booking is already cancelled or completed
      if (booking.status === 'CANCELLED') {
        throw new Error('Booking is already cancelled')
      }

      if (booking.status === 'COMPLETED') {
        throw new Error('Cannot cancel a completed booking')
      }

      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      })

      // Reset seat status to available (only if seat was assigned)
      if (booking.seatId) {
        await tx.seat.update({
          where: { id: booking.seatId },
          data: { status: 'AVAILABLE' },
        })
      }

      // Update available seats count in ride (only if ride is still active)
      if (booking.ride.status === 'ACTIVE') {
        await tx.ride.update({
          where: { id: booking.rideId },
          data: {
            availableSeats: {
              increment: 1,
            },
          },
        })
      }

      // Refund money to passenger's wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (wallet) {
        const balanceBefore = wallet.balance
        const refundAmount = booking.totalPrice
        const balanceAfter = balanceBefore + refundAmount

        await tx.wallet.update({
          where: { userId: session.user.id },
          data: { balance: balanceAfter },
        })

        // Create transaction record for refund
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'BOOKING_REFUND',
            amount: refundAmount,
            description: `Refund for cancelled booking`,
            bookingId: bookingId,
            rideId: booking.rideId,
            status: 'COMPLETED',
            balanceBefore,
            balanceAfter,
          },
        })
      }
    })

    revalidatePath('/p/dashboard')
    return {
      success: true,
      message: 'Booking cancelled and refunded successfully!',
    }
  } catch (error) {
    console.error('Cancel booking error:', error)
    throw error
  }
}
