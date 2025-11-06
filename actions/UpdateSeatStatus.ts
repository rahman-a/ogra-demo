'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'ON_MAINTENANCE'

export async function updateSeatStatus(formData: FormData) {
  const lng = await getLocaleFromCookies()
  const { t } = await getTranslation(lng, 'actions')
  const session = await auth()

  if (!session || !session.user) {
    throw new Error(t('errors.mustBeLoggedIn'))
  }

  const seatId = formData.get('seatId') as string
  const status = formData.get('status') as SeatStatus

  if (!seatId || !status) {
    throw new Error(t('errors.seatIdAndStatusRequired'))
  }

  // Validate status
  if (!['AVAILABLE', 'OCCUPIED', 'ON_MAINTENANCE'].includes(status)) {
    throw new Error(t('errors.invalidSeatStatus'))
  }

  try {
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    // Get the seat to verify ownership
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        vehicle: true,
      },
    })

    if (!seat) {
      throw new Error(t('errors.seatNotFound'))
    }

    // Check if user owns this vehicle
    if (seat.vehicle.userId !== session.user.id) {
      throw new Error(t('errors.canOnlyUpdateOwnVehicleSeats'))
    }

    // Update seat status
    await prisma.seat.update({
      where: { id: seatId },
      data: { status },
    })

    revalidatePath('/d/dashboard')

    return {
      success: true,
      message: t('success.seatStatusUpdated', {
        number: seat.seatNumber,
        status: status.toLowerCase(),
      }),
    }
  } catch (error) {
    console.error('Update seat status error:', error)
    throw error
  }
}
