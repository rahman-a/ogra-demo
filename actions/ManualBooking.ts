'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface ManualBookingResult {
  success: boolean
  message: string
  booking?: {
    id: string
    seatNumber: number
    totalPrice: number
  }
}

export async function createManualBooking(
  rideId: string,
  seatId: string
): Promise<ManualBookingResult> {
  try {
    const session = await auth()

    // Verify driver is logged in
    if (!session || !session.user) {
      return {
        success: false,
        message: 'You must be logged in to create manual bookings',
      }
    }

    // Verify user is a driver
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'DRIVER') {
      return {
        success: false,
        message: 'Only drivers can create manual bookings',
      }
    }

    // Get ride with route and vehicle information
    const ride = await prisma.ride.findUnique({
      where: { id: rideId, deletedAt: null },
      include: {
        route: {
          include: {
            vehicle: {
              include: {
                seats: {
                  where: { id: seatId },
                },
              },
            },
          },
        },
      },
    })

    if (!ride) {
      return {
        success: false,
        message: 'Ride not found',
      }
    }

    // Verify ride is active
    if (ride.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Ride is not active',
      }
    }

    // Verify driver owns this vehicle
    if (ride.route.vehicle.userId !== session.user.id) {
      return {
        success: false,
        message: 'You can only create manual bookings for your own vehicle',
      }
    }

    // Get seat information
    const seat = ride.route.vehicle.seats[0]
    if (!seat) {
      return {
        success: false,
        message: 'Seat not found',
      }
    }

    // Verify seat is available
    if (seat.status !== 'AVAILABLE') {
      return {
        success: false,
        message: `Seat #${seat.seatNumber} is not available`,
      }
    }

    // Verify seat is not already booked for this ride
    const existingBooking = await prisma.booking.findFirst({
      where: {
        rideId: ride.id,
        seatId: seat.id,
        status: 'CONFIRMED',
        deletedAt: null,
      },
    })

    if (existingBooking) {
      return {
        success: false,
        message: `Seat #${seat.seatNumber} is already booked`,
      }
    }

    // Check if there are available seats
    if (ride.availableSeats <= 0) {
      return {
        success: false,
        message: 'No available seats on this ride',
      }
    }

    // Create manual booking (cash payment)
    const bookingPrice = ride.route.pricePerSeat

    try {
      const booking = await prisma.$transaction(async (tx) => {
        // Create the booking with driver as the "passenger" to indicate manual/cash booking
        // Driver has already received cash directly, so no app earnings are added
        const newBooking = await tx.booking.create({
          data: {
            rideId: ride.id,
            passengerId: session.user.id, // Driver's ID to track who created it
            seatId: seat.id,
            totalPrice: bookingPrice,
            status: 'CONFIRMED',
          },
        })

        // Update seat status to occupied
        await tx.seat.update({
          where: { id: seat.id },
          data: { status: 'OCCUPIED' },
        })

        // Update available seats count in ride
        await tx.ride.update({
          where: { id: ride.id },
          data: {
            availableSeats: {
              decrement: 1,
            },
          },
        })

        // Note: We do NOT create a transaction record for cash payments
        // because the driver has already received the money directly from the passenger.
        // Only app-based bookings create RIDE_EARNING transactions that the app needs to pay out.

        return newBooking
      })

      // Revalidate the active ride page
      revalidatePath('/d/dashboard/active-ride')

      return {
        success: true,
        message: `Seat #${seat.seatNumber} marked as paid (cash)`,
        booking: {
          id: booking.id,
          seatNumber: seat.seatNumber,
          totalPrice: bookingPrice,
        },
      }
    } catch (error) {
      console.error('Manual booking error:', error)
      return {
        success: false,
        message: 'Failed to create manual booking',
      }
    }
  } catch (error) {
    console.error('Manual booking error:', error)
    return {
      success: false,
      message: 'Failed to process manual booking',
    }
  }
}

