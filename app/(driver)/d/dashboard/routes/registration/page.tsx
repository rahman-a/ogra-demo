import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
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

type Props = object

export default async function RouteRegistration({}: Props) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
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
    redirect('/d/dashboard/vehicles/registration')
  }

  // If route already exists, redirect to dashboard
  if (vehicle.route) {
    redirect('/d/dashboard')
  }

  return (
    <div className='min-h-screen bg-linear-to-b from-green-50 to-white p-4 pb-20'>
      {/* Header */}
      <div className='mb-6 pt-4'>
        <div className='flex items-center justify-between max-w-md mx-auto mb-4'>
          <Link href='/d/dashboard'>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6' />
            </Button>
          </Link>
          <div className='flex items-center gap-2'>
            <RouteIcon className='w-6 h-6 text-green-600' />
          </div>
        </div>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          Register Your Route
        </h1>
        <p className='text-center text-gray-600 mt-2'>
          Set up your fixed travel line
        </p>
      </div>

      {/* Vehicle Info */}
      <div className='max-w-md mx-auto mb-6'>
        <div className='bg-linear-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm opacity-90'>Your Vehicle</p>
              <h3 className='text-2xl font-bold'>{vehicle.vehicleNumber}</h3>
              <p className='text-sm mt-1'>
                {vehicle.vehicleType.toUpperCase()}
                {vehicle.model && ` • ${vehicle.model}`}
              </p>
            </div>
            <div className='text-center bg-white/20 rounded-lg px-4 py-3'>
              <div className='text-3xl font-bold'>{vehicle.capacity}</div>
              <div className='text-xs'>seats</div>
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
              Route Details
            </h2>
          </div>

          {/* Origin */}
          <div className='space-y-2'>
            <Label htmlFor='origin' className='text-base font-medium'>
              Origin City *
            </Label>
            <Input
              id='origin'
              name='origin'
              type='text'
              placeholder='e.g., Cairo'
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              Starting point of your route
            </p>
          </div>

          {/* Destination */}
          <div className='space-y-2'>
            <Label htmlFor='destination' className='text-base font-medium'>
              Destination City *
            </Label>
            <Input
              id='destination'
              name='destination'
              type='text'
              placeholder='e.g., Mansura'
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>End point of your route</p>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
            <p className='text-xs text-blue-700'>
              ℹ️ You can travel in both directions (Origin ↔ Destination)
            </p>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <IndianRupee className='w-5 h-5 text-green-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              Pricing & Additional Info
            </h2>
          </div>

          {/* Price per Seat */}
          <div className='space-y-2'>
            <Label
              htmlFor='pricePerSeat'
              className='text-base font-medium flex items-center gap-2'
            >
              <IndianRupee className='w-4 h-4' />
              Price per Seat *
            </Label>
            <Input
              id='pricePerSeat'
              name='pricePerSeat'
              type='number'
              min='0'
              step='0.01'
              placeholder='e.g., 150'
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              Fixed price per seat for this route
            </p>
          </div>

          {/* Distance (Optional) */}
          <div className='space-y-2'>
            <Label
              htmlFor='distance'
              className='text-base font-medium flex items-center gap-2'
            >
              <RouteIcon className='w-4 h-4' />
              Distance (km) - Optional
            </Label>
            <Input
              id='distance'
              name='distance'
              type='number'
              min='0'
              step='0.1'
              placeholder='e.g., 120'
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
              Duration (minutes) - Optional
            </Label>
            <Input
              id='duration'
              name='duration'
              type='number'
              min='0'
              placeholder='e.g., 90'
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
              Description - Optional
            </Label>
            <textarea
              id='description'
              name='description'
              rows={3}
              placeholder='e.g., Daily service with AC, comfortable seats'
              className='w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-4'>
          <SubmitButton />
        </div>
      </form>

      {/* Helper Text */}
      <div className='max-w-md mx-auto mt-6 text-center'>
        <p className='text-sm text-gray-500'>
          All fields marked with * are required
        </p>
        <p className='text-xs text-gray-400 mt-2'>
          You can only register one route per vehicle
        </p>
      </div>
    </div>
  )
}
