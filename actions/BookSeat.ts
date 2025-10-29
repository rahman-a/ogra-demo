'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function bookSeat(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('You must be logged in to book a seat')
  }

  const rideId = formData.get('rideId') as string
  const seatId = formData.get('seatId') as string | null

  if (!rideId) {
    throw new Error('Ride ID is required')
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get the ride with route information
      const ride = await tx.ride.findUnique({
        where: { id: rideId },
        include: {
          route: true,
          bookings: seatId ? { where: { seatId } } : undefined,
        },
      })

      if (!ride) {
        throw new Error('Ride not found')
      }

      if (ride.status !== 'ACTIVE') {
        throw new Error('This ride is not active')
      }

      // Get or create passenger's wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: session.user.id,
            balance: 0,
          },
        })
      }

      // Check wallet balance
      const bookingPrice = ride.route.pricePerSeat
      if (wallet.balance < bookingPrice) {
        throw new Error(
          `Insufficient wallet balance. Required: ${bookingPrice.toFixed(
            2
          )} EGP, Available: ${wallet.balance.toFixed(
            2
          )} EGP. Please charge your wallet first.`
        )
      }

      // Variable to store the created booking
      let createdBooking

      // If seatId is provided, validate and assign the seat
      if (seatId) {
        // Check if seat is already booked for this ride
        if (ride.bookings && ride.bookings.length > 0) {
          throw new Error('This seat is already booked for this ride')
        }

        // Get the seat and check if it's available
        const seat = await tx.seat.findUnique({
          where: { id: seatId },
        })

        if (!seat) {
          throw new Error('Seat not found')
        }

        // Prevent booking the driver seat (seat #1)
        if (seat.seatNumber === 1) {
          throw new Error(
            'Seat #1 is reserved for the driver and cannot be booked'
          )
        }

        if (seat.status !== 'AVAILABLE') {
          throw new Error(
            `Seat is not available. Status: ${seat.status.toLowerCase()}`
          )
        }

        // Create the booking with seat assignment
        createdBooking = await tx.booking.create({
          data: {
            rideId,
            passengerId: session.user.id,
            seatId,
            totalPrice: ride.route.pricePerSeat,
            status: 'CONFIRMED',
          },
        })

        // Update seat status to occupied
        await tx.seat.update({
          where: { id: seatId },
          data: { status: 'OCCUPIED' },
        })
      } else {
        // Create booking without seat assignment (for barcode scans without seat info)
        createdBooking = await tx.booking.create({
          data: {
            rideId,
            passengerId: session.user.id,
            seatId: null,
            totalPrice: ride.route.pricePerSeat,
            status: 'CONFIRMED',
          },
        })
      }

      // Update available seats count in ride
      await tx.ride.update({
        where: { id: rideId },
        data: {
          availableSeats: {
            decrement: 1,
          },
        },
      })

      // Deduct amount from passenger's wallet
      const balanceBefore = wallet.balance
      const balanceAfter = balanceBefore - bookingPrice

      await tx.wallet.update({
        where: { userId: session.user.id },
        data: { balance: balanceAfter },
      })

      // Create transaction record for payment
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'BOOKING_PAYMENT',
          amount: -bookingPrice,
          description: `Booking payment for ride from ${ride.route.origin} to ${ride.route.destination}`,
          bookingId: createdBooking.id,
          rideId,
          status: 'COMPLETED',
          balanceBefore,
          balanceAfter,
        },
      })
    })

    revalidatePath('/p/dashboard')
    return {
      success: true,
      message: seatId
        ? 'Seat booked successfully!'
        : 'Booking confirmed! Seat will be assigned on boarding.',
    }
  } catch (error) {
    console.error('Seat booking error:', error)
    throw error
  }
}
