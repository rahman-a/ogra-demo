import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Car, Hash, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerVehicle } from '@/actions/RegisterVehicle'
import { SubmitButton } from './VehicleForm'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function VehicleRegistration({ params }: Props) {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'dashboard')
  const session = await auth()

  if (!session || !session.user) {
    redirect(`/${lng}/auth/signin`)
  }

  const vehicleTypes = [
    { value: 'minibus', label: t('vehicleRegistration.minibus'), icon: '🚐' },
    { value: 'bus', label: t('vehicleRegistration.bus'), icon: '🚌' },
  ]

  // Fetch existing vehicle if any
  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  const isUpdateMode = !!existingVehicle

  return (
    <div className='min-h-screen bg-linear-to-b from-purple-50 to-white p-4 pb-20'>
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
            <Car className='w-6 h-6 text-purple-600' />
            {isUpdateMode && (
              <span className='text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full'>
                {t('vehicleRegistration.editMode')}
              </span>
            )}
          </div>
        </div>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          {isUpdateMode
            ? t('vehicleRegistration.titleUpdate')
            : t('vehicleRegistration.title')}
        </h1>
        <p className='text-center text-gray-600 mt-2'>
          {isUpdateMode
            ? t('vehicleRegistration.subtitleUpdate')
            : t('vehicleRegistration.subtitle')}
        </p>
      </div>

      {/* Registration Form */}
      <form action={registerVehicle} className='max-w-md mx-auto space-y-6'>
        {/* Vehicle Number */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Hash className='w-5 h-5 text-purple-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('vehicleRegistration.vehicleNumber')}
            </h2>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='vehicleNumber' className='text-base font-medium'>
              {t('vehicleRegistration.registrationNumber')}
            </Label>
            <Input
              id='vehicleNumber'
              name='vehicleNumber'
              type='text'
              placeholder={t('vehicleRegistration.numberPlaceholder')}
              defaultValue={existingVehicle?.vehicleNumber || ''}
              className='h-14 text-lg uppercase'
              required
            />
            <p className='text-xs text-gray-500'>
              {t('vehicleRegistration.enterRegNumber')}
            </p>
          </div>
        </div>

        {/* Vehicle Type */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Truck className='w-5 h-5 text-purple-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('vehicleRegistration.vehicleType')}
            </h2>
          </div>

          <div className='space-y-2'>
            <Label className='text-base font-medium'>
              {t('vehicleRegistration.selectType')}
            </Label>
            <div className='grid grid-cols-2 gap-4'>
              {vehicleTypes.map((type) => (
                <label key={type.value} className='relative cursor-pointer'>
                  <input
                    type='radio'
                    name='vehicleType'
                    value={type.value}
                    defaultChecked={existingVehicle?.vehicleType === type.value}
                    className='peer sr-only'
                    required
                  />
                  <div className='h-32 rounded-xl border-2 border-gray-200 bg-white p-6 text-center transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:shadow-md hover:border-purple-300 flex flex-col items-center justify-center gap-3'>
                    <span className='text-4xl'>{type.icon}</span>
                    <span className='text-base font-semibold text-gray-700'>
                      {type.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Car className='w-5 h-5 text-purple-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('vehicleRegistration.additionalDetails')}
            </h2>
          </div>

          {/* Model */}
          <div className='space-y-2'>
            <Label htmlFor='model' className='text-base font-medium'>
              {t('vehicleRegistration.vehicleModel')}
            </Label>
            <Input
              id='model'
              name='model'
              type='text'
              placeholder={t('vehicleRegistration.modelPlaceholder')}
              defaultValue={existingVehicle?.model || ''}
              className='h-12 text-base'
            />
          </div>

          {/* Capacity */}
          <div className='space-y-2'>
            <Label
              htmlFor='capacity'
              className='text-base font-medium flex items-center gap-2'
            >
              <Users className='w-4 h-4' />
              {t('vehicleRegistration.seatingCapacity')}
            </Label>
            <Input
              id='capacity'
              name='capacity'
              type='number'
              min='1'
              max='50'
              placeholder={t('vehicleRegistration.capacityPlaceholder')}
              defaultValue={existingVehicle?.capacity || ''}
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              {t('vehicleRegistration.numberOfPassengers')}
            </p>
            <p className='text-xs text-blue-600 font-medium'>
              {t('vehicleRegistration.requiredForDiagram')}
            </p>
            {isUpdateMode && existingVehicle && (
              <p className='text-xs text-orange-600 font-medium'>
                {t('vehicleRegistration.capacityWarning')}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-4'>
          <SubmitButton isUpdateMode={isUpdateMode} lng={lng} />
        </div>
      </form>

      {/* Helper Text */}
      <div className='max-w-md mx-auto mt-6 text-center'>
        <p className='text-sm text-gray-500'>
          {t('vehicleRegistration.requiredFieldsNote')}
        </p>
        {isUpdateMode ? (
          <p className='text-xs text-purple-600 mt-2 font-medium'>
            {t('vehicleRegistration.vehicleRegistered')}
          </p>
        ) : (
          <p className='text-xs text-gray-400 mt-2'>
            {t('vehicleRegistration.oneVehiclePerAccount')}
          </p>
        )}
      </div>
    </div>
  )
}
