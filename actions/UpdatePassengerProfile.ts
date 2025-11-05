'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface ProfileUpdateResult {
  success: boolean
  message: string
}

export async function updatePassengerProfile(
  formData: FormData
): Promise<ProfileUpdateResult> {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return {
        success: false,
        message: 'You must be logged in to update your profile',
      }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const dateOfBirth = formData.get('dateOfBirth') as string

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        message: 'Name is required',
      }
    }

    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: name.trim(),
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      })

      // Revalidate the profile page
      revalidatePath('/p/dashboard/profile')

      return {
        success: true,
        message: 'Profile updated successfully!',
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return {
        success: false,
        message: 'Failed to update profile. Please try again.',
      }
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}

