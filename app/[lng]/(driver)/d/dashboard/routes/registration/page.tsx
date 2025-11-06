import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Coins,
  Route as RouteIcon,
  Clock,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerRoute } from '@/actions/RegisterRoute'
import { SubmitButton } from './RouteForm'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function RouteRegistration({ params }: Props) {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'dashboard')
  const session = await auth()

  if (!session || !session.user) {
    redirect(`/${lng}/auth/signin`)
  }

  // Fetch user's vehicle
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      route: true,
    },
  })

  // If no vehicle, redirect to vehicle registration
  if (!vehicle) {
    redirect(`/${lng}/d/dashboard/vehicles/registration`)
  }

  // Check if route exists for update mode
  const existingRoute = vehicle.route
  const isUpdateMode = !!existingRoute

  return (
    <div className='min-h-screen bg-linear-to-b from-green-50 to-white p-4 pb-20'>
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
            <RouteIcon className='w-6 h-6 text-green-600' />
            {isUpdateMode && (
              <span className='text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                {t('routeRegistration.editMode')}
              </span>
            )}
          </div>
        </div>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          {isUpdateMode
            ? t('routeRegistration.updateTitle')
            : t('routeRegistration.registerTitle')}
        </h1>
        <p className='text-center text-gray-600 mt-2'>
          {isUpdateMode
            ? t('routeRegistration.updateSubtitle')
            : t('routeRegistration.registerSubtitle')}
        </p>
      </div>

      {/* Vehicle Info */}
      <div className='max-w-md mx-auto mb-6'>
        <div className='bg-linear-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm opacity-90'>
                {t('routeRegistration.yourVehicle')}
              </p>
              <h3 className='text-2xl font-bold'>{vehicle.vehicleNumber}</h3>
              <p className='text-sm mt-1'>
                {vehicle.vehicleType.toUpperCase()}
                {vehicle.model && ` • ${vehicle.model}`}
              </p>
            </div>
            <div className='text-center bg-white/20 rounded-lg px-4 py-3'>
              <div className='text-3xl font-bold'>{vehicle.capacity}</div>
              <div className='text-xs'>{t('routeRegistration.seats')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form action={registerRoute} className='max-w-md mx-auto space-y-6'>
        {/* Route Information */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <MapPin className='w-5 h-5 text-green-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('routeRegistration.routeDetails')}
            </h2>
          </div>

          {/* Origin */}
          <div className='space-y-2'>
            <Label htmlFor='origin' className='text-base font-medium'>
              {t('routeRegistration.originCity')} *
            </Label>
            <Input
              id='origin'
              name='origin'
              type='text'
              placeholder={t('routeRegistration.originPlaceholder')}
              defaultValue={existingRoute?.origin || ''}
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              {t('routeRegistration.originDescription')}
            </p>
          </div>

          {/* Destination */}
          <div className='space-y-2'>
            <Label htmlFor='destination' className='text-base font-medium'>
              {t('routeRegistration.destinationCity')} *
            </Label>
            <Input
              id='destination'
              name='destination'
              type='text'
              placeholder={t('routeRegistration.destinationPlaceholder')}
              defaultValue={existingRoute?.destination || ''}
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              {t('routeRegistration.destinationDescription')}
            </p>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
            <p className='text-xs text-blue-700'>
              {t('routeRegistration.bidirectionalInfo')}
            </p>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Coins className='w-5 h-5 text-green-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              {t('routeRegistration.pricingAndInfo')}
            </h2>
          </div>

          {/* Price per Seat */}
          <div className='space-y-2'>
            <Label
              htmlFor='pricePerSeat'
              className='text-base font-medium flex items-center gap-2'
            >
              <Coins className='w-4 h-4' />
              {t('routeRegistration.pricePerSeat')} *
            </Label>
            <Input
              id='pricePerSeat'
              name='pricePerSeat'
              type='number'
              min='0'
              step='0.01'
              placeholder={t('routeRegistration.pricePlaceholder')}
              defaultValue={existingRoute?.pricePerSeat || ''}
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              {t('routeRegistration.priceDescription')}
            </p>
          </div>

          {/* Distance (Optional) */}
          <div className='space-y-2'>
            <Label
              htmlFor='distance'
              className='text-base font-medium flex items-center gap-2'
            >
              <RouteIcon className='w-4 h-4' />
              {t('routeRegistration.distance')}
            </Label>
            <Input
              id='distance'
              name='distance'
              type='number'
              min='0'
              step='0.1'
              placeholder={t('routeRegistration.distancePlaceholder')}
              defaultValue={existingRoute?.distance || ''}
              className='h-12 text-base'
            />
          </div>

          {/* Duration (Optional) */}
          <div className='space-y-2'>
            <Label
              htmlFor='duration'
              className='text-base font-medium flex items-center gap-2'
            >
              <Clock className='w-4 h-4' />
              {t('routeRegistration.duration')}
            </Label>
            <Input
              id='duration'
              name='duration'
              type='number'
              min='0'
              placeholder={t('routeRegistration.durationPlaceholder')}
              defaultValue={existingRoute?.duration || ''}
              className='h-12 text-base'
            />
          </div>

          {/* Description (Optional) */}
          <div className='space-y-2'>
            <Label
              htmlFor='description'
              className='text-base font-medium flex items-center gap-2'
            >
              <FileText className='w-4 h-4' />
              {t('routeRegistration.description')}
            </Label>
            <textarea
              id='description'
              name='description'
              rows={3}
              placeholder={t('routeRegistration.descriptionPlaceholder')}
              defaultValue={existingRoute?.description || ''}
              className='w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
            />
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
          {t('routeRegistration.requiredFields')}
        </p>
        {isUpdateMode ? (
          <p className='text-xs text-green-600 mt-2 font-medium'>
            {t('routeRegistration.routeRegistered')}
          </p>
        ) : (
          <p className='text-xs text-gray-400 mt-2'>
            {t('routeRegistration.oneRoutePerVehicle')}
          </p>
        )}
      </div>
    </div>
  )
}
