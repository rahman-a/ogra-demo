'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function completeRide(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('You must be logged in')
  }

  const rideId = formData.get('rideId') as string

  if (!rideId) {
    throw new Error('Ride ID is required')
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get the ride with route and vehicle information
      const ride = await tx.ride.findUnique({
        where: { id: rideId },
        include: {
          route: {
            include: {
              vehicle: true,
            },
          },
          bookings: {
            where: {
              status: 'CONFIRMED',
            },
          },
        },
      })

      if (!ride) {
        throw new Error('Ride not found')
      }

      // Verify the user owns this ride
      if (ride.route.vehicle.userId !== session.user.id) {
        throw new Error('You can only complete your own rides')
      }

      // Check if ride is active
      if (ride.status !== 'ACTIVE') {
        throw new Error('Only active rides can be completed')
      }

      // Calculate total earnings
      const totalEarnings = ride.bookings.reduce(
        (sum, booking) => sum + booking.totalPrice,
        0
      )

      // Update ride status
      await tx.ride.update({
        where: { id: rideId },
        data: { status: 'COMPLETED' },
      })

      // Update all bookings status
      await tx.booking.updateMany({
        where: {
          rideId,
          status: 'CONFIRMED',
        },
        data: { status: 'COMPLETED' },
      })

      // Reset all occupied seats to available
      const seatIds = ride.bookings
        .map((b) => b.seatId)
        .filter((id): id is string => id !== null)

      if (seatIds.length > 0) {
        await tx.seat.updateMany({
          where: {
            id: { in: seatIds },
          },
          data: { status: 'AVAILABLE' },
        })
      }

      // Credit driver's wallet with earnings
      if (totalEarnings > 0) {
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

        const balanceBefore = wallet.balance
        const balanceAfter = balanceBefore + totalEarnings

        await tx.wallet.update({
          where: { userId: session.user.id },
          data: { balance: balanceAfter },
        })

        // Create transaction record for earnings
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'RIDE_EARNING',
            amount: totalEarnings,
            description: `Earnings from ride ${ride.route.origin} → ${ride.route.destination} (${ride.bookings.length} passengers)`,
            rideId: rideId,
            status: 'COMPLETED',
            balanceBefore,
            balanceAfter,
          },
        })
      }
    })

    revalidatePath('/d/dashboard')
    redirect('/d/dashboard')
  } catch (error) {
    console.error('Complete ride error:', error)
    throw error
  }
}
