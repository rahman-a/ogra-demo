'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

async function saveFile(
  file: File,
  userId: string,
  fileType: string
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `uploads/${userId}/${fileType}_${timestamp}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    // Return the blob URL
    return blob.url
  } catch (error) {
    console.error('File upload error:', error)
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    throw new Error(t('errors.failedToUploadFile', { fileType }))
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const driverId = formData.get('driverId') as string
  const driverLicenseNumber = formData.get('driverLicenseNumber') as string
  const carLicenseNumber = formData.get('carLicenseNumber') as string
  const dateOfBirth = formData.get('dateOfBirth') as string

  // Handle file uploads
  const driverIdDocument = formData.get('driverIdDocument') as File
  const driverLicenseDocument = formData.get('driverLicenseDocument') as File
  const carLicenseDocument = formData.get('carLicenseDocument') as File
  const criminalRecord = formData.get('criminalRecord') as File
  const drugReport = formData.get('drugReport') as File
  const formalPhoto = formData.get('formalPhoto') as File

  try {
    let driverIdDocumentPath = undefined
    let driverLicenseDocumentPath = undefined
    let carLicenseDocumentPath = undefined
    let criminalRecordPath = undefined
    let drugReportPath = undefined
    let formalPhotoPath = undefined

    // Save files if provided
    if (driverIdDocument && driverIdDocument.size > 0) {
      driverIdDocumentPath = await saveFile(
        driverIdDocument,
        session.user.id,
        'driver_id'
      )
    }
    if (driverLicenseDocument && driverLicenseDocument.size > 0) {
      driverLicenseDocumentPath = await saveFile(
        driverLicenseDocument,
        session.user.id,
        'driver_license'
      )
    }
    if (carLicenseDocument && carLicenseDocument.size > 0) {
      carLicenseDocumentPath = await saveFile(
        carLicenseDocument,
        session.user.id,
        'car_license'
      )
    }
    if (criminalRecord && criminalRecord.size > 0) {
      criminalRecordPath = await saveFile(
        criminalRecord,
        session.user.id,
        'criminal'
      )
    }
    if (drugReport && drugReport.size > 0) {
      drugReportPath = await saveFile(drugReport, session.user.id, 'drug')
    }
    if (formalPhoto && formalPhoto.size > 0) {
      formalPhotoPath = await saveFile(formalPhoto, session.user.id, 'photo')
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        driverId: driverId || undefined,
        driverLicenseNumber: driverLicenseNumber || undefined,
        carLicenseNumber: carLicenseNumber || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        driverIdDocument: driverIdDocumentPath || undefined,
        driverLicenseDocument: driverLicenseDocumentPath || undefined,
        carLicenseDocument: carLicenseDocumentPath || undefined,
        criminalRecord: criminalRecordPath || undefined,
        drugReport: drugReportPath || undefined,
        formalPhoto: formalPhotoPath || undefined,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    throw new Error(t('errors.failedToUpdateProfile'))
  }

  // Revalidate paths to refresh data
  revalidatePath('/d/dashboard/profile')
  return
}
