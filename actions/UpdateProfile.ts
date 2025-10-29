'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

async function saveFile(
  file: File,
  userId: string,
  fileType: string
): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create uploads directory if it doesn't exist
  const uploadDir = join(process.cwd(), 'public', 'uploads', userId)
  await mkdir(uploadDir, { recursive: true })

  // Generate unique filename
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const filename = `${fileType}_${timestamp}.${extension}`
  const filepath = join(uploadDir, filename)

  // Save file
  await writeFile(filepath, buffer)

  // Return relative path for storing in database
  return `/uploads/${userId}/${filename}`
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
  const pincode = formData.get('pincode') as string
  const licenseNumber = formData.get('licenseNumber') as string
  const dateOfBirth = formData.get('dateOfBirth') as string

  // Handle file uploads
  const licenseDocument = formData.get('licenseDocument') as File
  const criminalRecord = formData.get('criminalRecord') as File
  const drugReport = formData.get('drugReport') as File
  const formalPhoto = formData.get('formalPhoto') as File

  try {
    let licenseDocumentPath = undefined
    let criminalRecordPath = undefined
    let drugReportPath = undefined
    let formalPhotoPath = undefined

    // Save files if provided
    if (licenseDocument && licenseDocument.size > 0) {
      licenseDocumentPath = await saveFile(
        licenseDocument,
        session.user.id,
        'license'
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
        pincode: pincode || undefined,
        licenseNumber: licenseNumber || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        licenseDocument: licenseDocumentPath || undefined,
        criminalRecord: criminalRecordPath || undefined,
        drugReport: drugReportPath || undefined,
        formalPhoto: formalPhotoPath || undefined,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    throw new Error('Failed to update profile')
  }

  // Revalidate paths to refresh data
  revalidatePath('/d/dashboard/profile')
  return
}
