import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { updateProfile } from '@/actions/UpdateProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Phone,
  CreditCard,
  Calendar,
  Upload,
  FileText,
  Shield,
  Camera,
  Car,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { SubmitButton } from './ProfileForm'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

// Extended User type with profile fields
type ExtendedUser = {
  id: string
  name: string
  email: string
  image: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  driverId?: string | null
  driverLicenseNumber?: string | null
  carLicenseNumber?: string | null
  dateOfBirth?: Date | null
  driverIdDocument?: string | null
  driverLicenseDocument?: string | null
  carLicenseDocument?: string | null
  criminalRecord?: string | null
  drugReport?: string | null
  formalPhoto?: string | null
}

// Calculate profile completeness
function calculateProfileCompletion(user: ExtendedUser): number {
  const fields: (keyof ExtendedUser)[] = [
    'name',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'driverId',
    'driverLicenseNumber',
    'carLicenseNumber',
    'dateOfBirth',
    'driverIdDocument',
    'driverLicenseDocument',
    'carLicenseDocument',
    'criminalRecord',
    'drugReport',
    'formalPhoto',
  ]

  const completedFields = fields.filter((field) => {
    const value = user[field]
    return value !== null && value !== undefined && value !== ''
  }).length

  return Math.round((completedFields / fields.length) * 100)
}

type Props = {
  params: Promise<{ lng: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'dashboard')
  const session = await auth()

  if (!session || !session.user) {
    redirect(`/${lng}/auth/signin`)
  }

  console.log('session id: ', session.user.id)

  const user = (await prisma.user.findUnique({
    where: { id: session.user.id },
  })) as ExtendedUser | null

  if (!user) {
    redirect(`/${lng}/auth/signin`)
  }

  const profileCompletion = calculateProfileCompletion(user!)

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white p-4 pb-20'>
      {/* Header */}
      <div className='mb-6 pt-4'>
        <div className='flex items-center justify-between max-w-md mx-auto mb-4'>
          <Link href={`/${lng}/d/dashboard`}>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6 ltr:block rtl:hidden' />
              <ArrowRight className='w-6 h-6 ltr:hidden rtl:block' />
            </Button>
          </Link>
          <div className='flex items-center gap-2'>
            <div className='bg-green-100 rounded-full px-4 py-2'>
              <span className='text-green-700 font-bold text-sm'>
                {profileCompletion}% {t('driverProfile.complete')}
              </span>
            </div>
          </div>
        </div>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          {t('driverProfile.title')}
        </h1>
        <p className='text-center text-gray-600 mt-2'>
          {t('driverProfile.subtitle')}
        </p>
      </div>

      {/* Profile Form */}
      <form action={updateProfile} className='max-w-md mx-auto space-y-6'>
        {/* Profile Photo Upload */}
        <div className='flex justify-center mb-6'>
          <div className='relative'>
            <input
              type='file'
              id='formalPhoto'
              name='formalPhoto'
              accept='image/*'
              className='hidden'
            />
            <label htmlFor='formalPhoto' className='cursor-pointer block'>
              <div className='w-32 h-32 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-2xl border-4 border-white hover:scale-105 transition-transform duration-200 overflow-hidden'>
                {user?.formalPhoto ? (
                  <Image
                    src={user.formalPhoto}
                    alt='Profile Photo'
                    width={128}
                    height={128}
                    className='w-full h-full rounded-full object-cover'
                    priority
                  />
                ) : (
                  <div className='flex flex-col items-center gap-2 text-white'>
                    <Camera className='w-12 h-12' />
                    <span className='text-xs font-medium'>
                      {t('driverProfile.addPhoto')}
                    </span>
                  </div>
                )}
              </div>
            </label>
            {user?.formalPhoto && (
              <div className='absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-2 border-white'>
                <CheckCircle2 className='w-5 h-5 text-white' />
              </div>
            )}
            {!user?.formalPhoto && (
              <div className='absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 border-2 border-white'>
                <Upload className='w-5 h-5 text-white' />
              </div>
            )}
          </div>
        </div>
        <p className='text-center text-sm text-gray-500 -mt-2 mb-6'>
          {user?.formalPhoto
            ? t('driverProfile.clickToChangePhoto')
            : t('driverProfile.clickToUploadPhoto')}
        </p>

        {/* Personal Information Section */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <User className='w-5 h-5 text-blue-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('driverProfile.personalInformation')}
            </h2>
          </div>

          {/* Name */}
          <div className='space-y-2'>
            <Label
              htmlFor='name'
              className='text-base font-medium flex items-center gap-2'
            >
              {t('driverProfile.fullName')}
              {user?.name && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='name'
              name='name'
              type='text'
              defaultValue={user?.name || ''}
              placeholder={t('driverProfile.enterFullName')}
              className='h-12 text-base'
              required
            />
          </div>

          {/* Email (Read-only) */}
          <div className='space-y-2'>
            <Label
              htmlFor='email'
              className='text-base font-medium flex items-center gap-2'
            >
              {t('driverProfile.email')}
              <CheckCircle2 className='w-4 h-4 text-green-600' />
            </Label>
            <Input
              id='email'
              type='email'
              defaultValue={user?.email}
              disabled
              className='h-12 text-base bg-gray-100'
            />
          </div>

          {/* Date of Birth */}
          <div className='space-y-2'>
            <Label
              htmlFor='dateOfBirth'
              className='text-base font-medium flex items-center gap-2'
            >
              <Calendar className='w-4 h-4' />
              {t('driverProfile.dateOfBirth')}
              {user?.dateOfBirth && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='dateOfBirth'
              name='dateOfBirth'
              type='date'
              defaultValue={
                user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toISOString().split('T')[0]
                  : ''
              }
              className='h-12 text-base'
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Phone className='w-5 h-5 text-green-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('driverProfile.contactInformation')}
            </h2>
          </div>

          {/* Phone */}
          <div className='space-y-2'>
            <Label
              htmlFor='phone'
              className='text-base font-medium flex items-center gap-2'
            >
              {t('driverProfile.phoneNumber')}
              {user?.phone && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='phone'
              name='phone'
              type='tel'
              defaultValue={user?.phone || ''}
              placeholder={t('driverProfile.enterPhoneNumber')}
              className='h-12 text-base'
            />
          </div>

          {/* Address */}
          <div className='space-y-2'>
            <Label
              htmlFor='address'
              className='text-base font-medium flex items-center gap-2'
            >
              {t('driverProfile.address')}
              {user?.address && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='address'
              name='address'
              type='text'
              defaultValue={user?.address || ''}
              placeholder={t('driverProfile.enterAddress')}
              className='h-12 text-base'
            />
          </div>

          {/* City */}
          <div className='space-y-2'>
            <Label
              htmlFor='city'
              className='text-base font-medium flex items-center gap-2'
            >
              {t('driverProfile.city')}
              {user?.city && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='city'
              name='city'
              type='text'
              defaultValue={user?.city || ''}
              placeholder={t('driverProfile.enterCity')}
              className='h-12 text-base'
            />
          </div>

          {/* State */}
          <div className='space-y-2'>
            <Label
              htmlFor='state'
              className='text-base font-medium flex items-center gap-2'
            >
              {t('driverProfile.state')}
              {user?.state && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='state'
              name='state'
              type='text'
              defaultValue={user?.state || ''}
              placeholder={t('driverProfile.enterState')}
              className='h-12 text-base'
            />
          </div>
        </div>

        {/* Driver ID & Licenses Section */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <CreditCard className='w-5 h-5 text-purple-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('driverProfile.driverIdAndLicenses')}
            </h2>
          </div>

          {/* Driver ID */}
          <div className='space-y-2'>
            <Label
              htmlFor='driverId'
              className='text-base font-medium flex items-center gap-2'
            >
              <Shield className='w-4 h-4' />
              {t('driverProfile.driverIdNumber')}
              {user?.driverId && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='driverId'
              name='driverId'
              type='text'
              defaultValue={user?.driverId || ''}
              placeholder={t('driverProfile.enterDriverId')}
              className='h-12 text-base'
            />
          </div>

          {/* Driver ID Document Upload */}
          <div className='space-y-2'>
            <Label
              htmlFor='driverIdDocument'
              className='text-base font-medium flex items-center gap-2'
            >
              <Upload className='w-4 h-4' />
              {t('driverProfile.driverIdDocument')}
              {user?.driverIdDocument && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <div className='relative'>
              <Input
                id='driverIdDocument'
                name='driverIdDocument'
                type='file'
                accept='image/*,.pdf'
                className='h-12 text-base cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
              />
            </div>
            {user?.driverIdDocument && (
              <p className='text-xs text-green-600'>
                {t('driverProfile.uploaded')}
              </p>
            )}
            <p className='text-xs text-gray-500'>
              {t('driverProfile.uploadIdDescription')}
            </p>
          </div>

          {/* Driver License Number */}
          <div className='space-y-2'>
            <Label
              htmlFor='driverLicenseNumber'
              className='text-base font-medium flex items-center gap-2'
            >
              {t('driverProfile.driverLicenseNumber')}
              {user?.driverLicenseNumber && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='driverLicenseNumber'
              name='driverLicenseNumber'
              type='text'
              defaultValue={user?.driverLicenseNumber || ''}
              placeholder={t('driverProfile.enterDriverLicense')}
              className='h-12 text-base'
            />
          </div>

          {/* Driver License Document Upload */}
          <div className='space-y-2'>
            <Label
              htmlFor='driverLicenseDocument'
              className='text-base font-medium flex items-center gap-2'
            >
              <Upload className='w-4 h-4' />
              {t('driverProfile.driverLicensePhoto')}
              {user?.driverLicenseDocument && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <div className='relative'>
              <Input
                id='driverLicenseDocument'
                name='driverLicenseDocument'
                type='file'
                accept='image/*,.pdf'
                className='h-12 text-base cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />
            </div>
            {user?.driverLicenseDocument && (
              <p className='text-xs text-green-600'>
                {t('driverProfile.uploaded')}
              </p>
            )}
          </div>

          {/* Car License Number */}
          <div className='space-y-2'>
            <Label
              htmlFor='carLicenseNumber'
              className='text-base font-medium flex items-center gap-2'
            >
              <Car className='w-4 h-4' />
              {t('driverProfile.carLicenseNumber')}
              {user?.carLicenseNumber && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <Input
              id='carLicenseNumber'
              name='carLicenseNumber'
              type='text'
              defaultValue={user?.carLicenseNumber || ''}
              placeholder={t('driverProfile.enterCarLicense')}
              className='h-12 text-base'
            />
          </div>

          {/* Car License Document Upload */}
          <div className='space-y-2'>
            <Label
              htmlFor='carLicenseDocument'
              className='text-base font-medium flex items-center gap-2'
            >
              <Upload className='w-4 h-4' />
              {t('driverProfile.carLicensePhoto')}
              {user?.carLicenseDocument && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <div className='relative'>
              <Input
                id='carLicenseDocument'
                name='carLicenseDocument'
                type='file'
                accept='image/*,.pdf'
                className='h-12 text-base cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100'
              />
            </div>
            {user?.carLicenseDocument && (
              <p className='text-xs text-green-600'>
                {t('driverProfile.uploaded')}
              </p>
            )}
          </div>
        </div>

        {/* Required Documents Section */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <FileText className='w-5 h-5 text-orange-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('driverProfile.requiredDocuments')}
            </h2>
          </div>

          {/* Criminal Record */}
          <div className='space-y-2'>
            <Label
              htmlFor='criminalRecord'
              className='text-base font-medium flex items-center gap-2'
            >
              <Shield className='w-4 h-4' />
              {t('driverProfile.criminalRecord')}
              {user?.criminalRecord && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <div className='relative'>
              <Input
                id='criminalRecord'
                name='criminalRecord'
                type='file'
                accept='image/*,.pdf'
                className='h-12 text-base cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100'
              />
            </div>
            {user?.criminalRecord && (
              <p className='text-xs text-green-600'>
                {t('driverProfile.uploaded')}
              </p>
            )}
            <p className='text-xs text-gray-500'>
              {t('driverProfile.uploadCriminalRecord')}
            </p>
          </div>

          {/* Drug Report */}
          <div className='space-y-2'>
            <Label
              htmlFor='drugReport'
              className='text-base font-medium flex items-center gap-2'
            >
              <FileText className='w-4 h-4' />
              {t('driverProfile.drugTest')}
              {user?.drugReport && (
                <CheckCircle2 className='w-4 h-4 text-green-600' />
              )}
            </Label>
            <div className='relative'>
              <Input
                id='drugReport'
                name='drugReport'
                type='file'
                accept='image/*,.pdf'
                className='h-12 text-base cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100'
              />
            </div>
            {user?.drugReport && (
              <p className='text-xs text-green-600'>
                {t('driverProfile.uploaded')}
              </p>
            )}
            <p className='text-xs text-gray-500'>
              {t('driverProfile.uploadDrugTest')}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-4'>
          <SubmitButton lng={lng} />
        </div>
      </form>

      {/* Helper Text */}
      <div className='max-w-md mx-auto mt-6 text-center'>
        <p className='text-sm text-gray-500'>{t('driverProfile.helperText')}</p>
      </div>
    </div>
  )
}
