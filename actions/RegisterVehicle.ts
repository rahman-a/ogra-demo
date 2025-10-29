'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerVehicle(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  // Check if user already has a vehicle (one-to-one relationship)
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { userId: session.user.id },
  })

  if (existingVehicle) {
    throw new Error(
      'You can only register one vehicle. Please update your existing vehicle instead.'
    )
  }

  const vehicleNumber = formData.get('vehicleNumber') as string
  const vehicleType = formData.get('vehicleType') as string
  const model = formData.get('model') as string
  const capacity = formData.get('capacity') as string

  // Validate required fields
  if (!vehicleNumber || !vehicleType || !capacity) {
    throw new Error('Vehicle number, type, and seating capacity are required')
  }

  const capacityNum = parseInt(capacity)
  if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 50) {
    throw new Error('Seating capacity must be between 1 and 50')
  }

  try {
    // Create vehicle and seats in a transaction
    await prisma.$transaction(async (tx) => {
      // Create the vehicle
      const vehicle = await tx.vehicle.create({
        data: {
          userId: session.user.id,
          vehicleNumber: vehicleNumber.toUpperCase(),
          vehicleType,
          model: model || null,
          capacity: capacityNum,
        },
      })

      // Create individual seats for the vehicle
      const seatData = Array.from({ length: capacityNum }, (_, index) => ({
        vehicleId: vehicle.id,
        seatNumber: index + 1, // Seat numbers start from 1
        status: 'AVAILABLE' as const,
      }))

      await tx.seat.createMany({
        data: seatData,
      })
    })
  } catch (error) {
    console.error('Vehicle registration error:', error)
    throw new Error('Failed to register vehicle and seats')
  }

  // Revalidate and redirect to route registration
  revalidatePath('/d/dashboard')
  redirect('/d/dashboard/routes/registration')
}
