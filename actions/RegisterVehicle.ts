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

  const isUpdateMode = !!existingVehicle

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
    if (isUpdateMode) {
      // Update existing vehicle
      await prisma.$transaction(async (tx) => {
        // Update the vehicle
        await tx.vehicle.update({
          where: { userId: session.user.id },
          data: {
            vehicleNumber: vehicleNumber.toUpperCase(),
            vehicleType,
            model: model || null,
            capacity: capacityNum,
          },
        })

        // If capacity changed, adjust seats
        const existingSeatCount = await tx.seat.count({
          where: { vehicleId: existingVehicle.id },
        })

        if (existingSeatCount !== capacityNum) {
          // Delete all existing seats
          await tx.seat.deleteMany({
            where: { vehicleId: existingVehicle.id },
          })

          // Create new seats with updated capacity
          const seatData = Array.from({ length: capacityNum }, (_, index) => ({
            vehicleId: existingVehicle.id,
            seatNumber: index + 1,
            status: 'AVAILABLE' as const,
          }))

          await tx.seat.createMany({
            data: seatData,
          })
        }
      })
    } else {
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
    }
  } catch (error) {
    console.error('Vehicle registration error:', error)
    throw new Error(
      isUpdateMode
        ? 'Failed to update vehicle information'
        : 'Failed to register vehicle and seats'
    )
  }

  // Revalidate paths
  revalidatePath('/d/dashboard')
  revalidatePath('/d/dashboard/vehicles/registration')

  // Redirect based on mode
  if (isUpdateMode) {
    redirect('/d/dashboard')
  } else {
    redirect('/d/dashboard/routes/registration')
  }
}
