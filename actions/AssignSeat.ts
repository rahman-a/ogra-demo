'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function assignSeat(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('You must be logged in')
  }

  const bookingId = formData.get('bookingId') as string
  const seatId = formData.get('seatId') as string

  if (!bookingId || !seatId) {
    throw new Error('Booking ID and Seat ID are required')
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
        throw new Error('Booking not found')
      }

      // Check if booking already has a seat
      if (booking.seatId) {
        throw new Error('Booking already has a seat assigned')
      }

      // Check if booking is cancelled or completed
      if (booking.status === 'CANCELLED') {
        throw new Error('Cannot assign seat to a cancelled booking')
      }

      if (booking.status === 'COMPLETED') {
        throw new Error('Cannot assign seat to a completed booking')
      }

      // Get the seat and verify it belongs to the vehicle for this ride
      const seat = await tx.seat.findUnique({
        where: { id: seatId },
      })

      if (!seat) {
        throw new Error('Seat not found')
      }

      // Verify seat belongs to the correct vehicle
      if (seat.vehicleId !== booking.ride.route.vehicle.id) {
        throw new Error('Seat does not belong to this vehicle')
      }

      // Check if seat is available
      if (seat.status !== 'AVAILABLE') {
        throw new Error(
          `Seat is not available. Status: ${seat.status.toLowerCase()}`
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
        throw new Error('This seat is already booked for this ride')
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
    return { success: true, message: 'Seat assigned successfully!' }
  } catch (error) {
    console.error('Assign seat error:', error)
    throw error
  }
}
