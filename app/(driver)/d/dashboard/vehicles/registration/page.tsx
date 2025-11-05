import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Car, Hash, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerVehicle } from '@/actions/RegisterVehicle'
import { SubmitButton } from './VehicleForm'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

type Props = object

const vehicleTypes = [
  { value: 'minibus', label: 'Minibus', icon: '🚐' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
]

export default async function VehicleRegistration({}: Props) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/auth/signin')
  }

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
          <Link href='/d/dashboard'>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6' />
            </Button>
          </Link>
          <div className='flex items-center gap-2'>
            <Car className='w-6 h-6 text-purple-600' />
            {isUpdateMode && (
              <span className='text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full'>
                Edit Mode
              </span>
            )}
          </div>
        </div>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          {isUpdateMode ? 'Update Your Vehicle' : 'Register Your Vehicle'}
        </h1>
        <p className='text-center text-gray-600 mt-2'>
          {isUpdateMode
            ? 'Modify your vehicle details'
            : 'Add your vehicle details'}
        </p>
      </div>

      {/* Registration Form */}
      <form action={registerVehicle} className='max-w-md mx-auto space-y-6'>
        {/* Vehicle Number */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Hash className='w-5 h-5 text-purple-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              Vehicle Number
            </h2>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='vehicleNumber' className='text-base font-medium'>
              Registration Number *
            </Label>
            <Input
              id='vehicleNumber'
              name='vehicleNumber'
              type='text'
              placeholder='e.g., MH12AB1234'
              defaultValue={existingVehicle?.vehicleNumber || ''}
              className='h-14 text-lg uppercase'
              required
            />
            <p className='text-xs text-gray-500'>
              Enter your vehicle registration number
            </p>
          </div>
        </div>

        {/* Vehicle Type */}
        <div className='bg-white rounded-2xl shadow-lg p-6 space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Truck className='w-5 h-5 text-purple-600' />
            <h2 className='text-lg font-semibold text-gray-800'>
              Vehicle Type
            </h2>
          </div>

          <div className='space-y-2'>
            <Label className='text-base font-medium'>Select Type *</Label>
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
              Additional Details
            </h2>
          </div>

          {/* Model */}
          <div className='space-y-2'>
            <Label htmlFor='model' className='text-base font-medium'>
              Vehicle Model (Optional)
            </Label>
            <Input
              id='model'
              name='model'
              type='text'
              placeholder='e.g., Toyota Innova'
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
              Seating Capacity *
            </Label>
            <Input
              id='capacity'
              name='capacity'
              type='number'
              min='1'
              max='50'
              placeholder='e.g., 7'
              defaultValue={existingVehicle?.capacity || ''}
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              Number of passengers (including driver)
            </p>
            <p className='text-xs text-blue-600 font-medium'>
              Required for seat selection diagram
            </p>
            {isUpdateMode && existingVehicle && (
              <p className='text-xs text-orange-600 font-medium'>
                ⚠️ Changing capacity will reset all seat assignments
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-4'>
          <SubmitButton isUpdateMode={isUpdateMode} />
        </div>
      </form>

      {/* Helper Text */}
      <div className='max-w-md mx-auto mt-6 text-center'>
        <p className='text-sm text-gray-500'>
          * Required fields must be filled
        </p>
        {isUpdateMode ? (
          <p className='text-xs text-purple-600 mt-2 font-medium'>
            ✓ Vehicle registered - You can update the information anytime
          </p>
        ) : (
          <p className='text-xs text-gray-400 mt-2'>
            You can only register one vehicle per account
          </p>
        )}
      </div>
    </div>
  )
}
