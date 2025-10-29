'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function startRide(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  const direction = formData.get('direction') as string

  if (!direction || (direction !== 'FORWARD' && direction !== 'RETURN')) {
    throw new Error('Invalid direction')
  }

  // Get user's vehicle and route
  const vehicle = await prisma.vehicle.findUnique({
    where: { userId: session.user.id },
    include: { route: true },
  })

  if (!vehicle) {
    throw new Error('You need to register a vehicle first')
  }

  if (!vehicle.route) {
    throw new Error('You need to register a route first')
  }

  // Check if there's already an active ride
  const activeRide = await prisma.ride.findFirst({
    where: {
      routeId: vehicle.route.id,
      status: 'ACTIVE',
    },
  })

  if (activeRide) {
    throw new Error(
      'You already have an active ride. Please complete it before starting a new one.'
    )
  }

  try {
    await prisma.ride.create({
      data: {
        routeId: vehicle.route.id,
        direction: direction as 'FORWARD' | 'RETURN',
        departureTime: new Date(),
        availableSeats: vehicle.capacity,
        status: 'ACTIVE',
      },
    })
  } catch (error) {
    console.error('Start ride error:', error)
    throw new Error('Failed to start ride')
  }

  // Revalidate and redirect to active ride page
  revalidatePath('/d/dashboard')
  revalidatePath('/d/dashboard/active-ride')
  redirect('/d/dashboard/active-ride')
}
