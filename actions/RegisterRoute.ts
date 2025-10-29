'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerRoute(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  // Get user's vehicle
  const vehicle = await prisma.vehicle.findUnique({
    where: { userId: session.user.id },
    include: { route: true },
  })

  if (!vehicle) {
    throw new Error('You need to register a vehicle first')
  }

  if (vehicle.route) {
    throw new Error(
      'You can only register one route for your vehicle. Please update your existing route instead.'
    )
  }

  const origin = formData.get('origin') as string
  const destination = formData.get('destination') as string
  const pricePerSeat = formData.get('pricePerSeat') as string
  const distance = formData.get('distance') as string
  const duration = formData.get('duration') as string
  const description = formData.get('description') as string

  // Validate required fields
  if (!origin || !destination || !pricePerSeat) {
    throw new Error('Origin, destination, and price per seat are required')
  }

  const price = parseFloat(pricePerSeat)
  if (isNaN(price) || price < 0) {
    throw new Error('Price must be a valid positive number')
  }

  let distanceNum = null
  if (distance) {
    distanceNum = parseFloat(distance)
    if (isNaN(distanceNum) || distanceNum < 0) {
      throw new Error('Distance must be a valid positive number')
    }
  }

  let durationNum = null
  if (duration) {
    durationNum = parseInt(duration)
    if (isNaN(durationNum) || durationNum < 0) {
      throw new Error('Duration must be a valid positive number')
    }
  }

  try {
    await prisma.route.create({
      data: {
        vehicleId: vehicle.id,
        origin: origin.trim(),
        destination: destination.trim(),
        pricePerSeat: price,
        distance: distanceNum,
        duration: durationNum,
        description: description?.trim() || null,
      },
    })
  } catch (error) {
    console.error('Route registration error:', error)
    throw new Error('Failed to register route')
  }

  // Revalidate and redirect
  revalidatePath('/d/dashboard')
  redirect('/d/dashboard')
}
