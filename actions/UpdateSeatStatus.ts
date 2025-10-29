'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'ON_MAINTENANCE'

export async function updateSeatStatus(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('You must be logged in')
  }

  const seatId = formData.get('seatId') as string
  const status = formData.get('status') as SeatStatus

  if (!seatId || !status) {
    throw new Error('Seat ID and status are required')
  }

  // Validate status
  if (!['AVAILABLE', 'OCCUPIED', 'ON_MAINTENANCE'].includes(status)) {
    throw new Error('Invalid seat status')
  }

  try {
    // Get the seat to verify ownership
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        vehicle: true,
      },
    })

    if (!seat) {
      throw new Error('Seat not found')
    }

    // Check if user owns this vehicle
    if (seat.vehicle.userId !== session.user.id) {
      throw new Error('You can only update seats in your own vehicle')
    }

    // Update seat status
    await prisma.seat.update({
      where: { id: seatId },
      data: { status },
    })

    revalidatePath('/d/dashboard')
    return {
      success: true,
      message: `Seat ${
        seat.seatNumber
      } status updated to ${status.toLowerCase()}`,
    }
  } catch (error) {
    console.error('Update seat status error:', error)
    throw error
  }
}
