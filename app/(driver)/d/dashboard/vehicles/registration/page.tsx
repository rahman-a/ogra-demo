import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Car, Hash, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerVehicle } from '@/actions/RegisterVehicle'
import { SubmitButton } from './VehicleForm'

type Props = object

const vehicleTypes = [
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: 'microbus', label: 'Microbus', icon: '🚐' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'truck', label: 'Truck', icon: '🚚' },
  { value: 'auto', label: 'Auto Rickshaw', icon: '🛺' },
]

export default function VehicleRegistration({}: Props) {
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
          </div>
        </div>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          Register Your Vehicle
        </h1>
        <p className='text-center text-gray-600 mt-2'>
          Add your vehicle details
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
            <div className='grid grid-cols-2 gap-3'>
              {vehicleTypes.map((type) => (
                <label key={type.value} className='relative cursor-pointer'>
                  <input
                    type='radio'
                    name='vehicleType'
                    value={type.value}
                    className='peer sr-only'
                    required
                  />
                  <div className='h-24 rounded-xl border-2 border-gray-200 bg-white p-4 text-center transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:shadow-md hover:border-purple-300 flex flex-col items-center justify-center gap-2'>
                    <span className='text-3xl'>{type.icon}</span>
                    <span className='text-sm font-medium text-gray-700'>
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
              className='h-12 text-base'
              required
            />
            <p className='text-xs text-gray-500'>
              Number of passengers (including driver)
            </p>
            <p className='text-xs text-blue-600 font-medium'>
              Required for seat selection diagram
            </p>
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
          * Required fields must be filled
        </p>
      </div>
    </div>
  )
}
