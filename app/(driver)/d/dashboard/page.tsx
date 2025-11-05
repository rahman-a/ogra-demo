import React from 'react'
import Link from 'next/link'
import {
  Play,
  Route as RouteIcon,
  Car,
  AlertCircle,
  User,
  MapPin,
  ArrowLeftRight,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { startRide } from '@/actions/StartRide'
import { completeRide } from '@/actions/CompleteRide'
import { DriverNavigation } from '@/components/driver/DriverNavigation'

type Props = object

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
function calculateProfileCompletion(user: ExtendedUser | null): number {
  if (!user) return 0

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

export default async function DriverDashboard({}: Props) {
  const session = await auth()

  // Fetch user profile, vehicle (with route), and rides
  const [user, vehicle] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session?.user?.id },
    }) as Promise<ExtendedUser | null>,
    prisma.vehicle.findUnique({
      where: {
        userId: session?.user?.id || '',
      },
      include: {
        route: {
          include: {
            rides: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    }),
  ])

  const hasVehicle = !!vehicle
  const hasRoute = !!vehicle?.route
  const rides = vehicle?.route?.rides || []
  const activeRide = rides.find((r) => r.status === 'ACTIVE')
  const profileCompletion = calculateProfileCompletion(user)
  const canStartRide =
    hasVehicle && hasRoute && profileCompletion === 100 && !activeRide

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white p-4 pb-20'>
      {/* Header */}
      <div className='mb-6 pt-4'>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          Welcome Driver!
        </h1>
        <p className='text-center text-gray-600 mt-2 text-lg'>
          Ready to start your day?
        </p>
      </div>

      {/* Quick Stats */}
      <div className='max-w-md mx-auto mb-6 grid grid-cols-3 gap-3'>
        <div className='bg-white rounded-xl shadow p-4 text-center'>
          <div className='text-3xl font-bold text-green-600'>
            {
              rides.filter((r) => {
                const today = new Date()
                const rideDate = new Date(r.createdAt)
                return rideDate.toDateString() === today.toDateString()
              }).length
            }
          </div>
          <div className='text-xs text-gray-500 mt-1'>Today&apos;s Rides</div>
        </div>
        <div className='bg-white rounded-xl shadow p-4 text-center'>
          <div className='text-3xl font-bold text-blue-600'>{rides.length}</div>
          <div className='text-xs text-gray-500 mt-1'>Total Rides</div>
        </div>
        <div className='bg-white rounded-xl shadow p-4 text-center'>
          <div className='text-3xl font-bold text-purple-600'>
            {hasVehicle ? '1' : '0'}
          </div>
          <div className='text-xs text-gray-500 mt-1'>Vehicle</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <DriverNavigation hasVehicle={hasVehicle} hasRoute={hasRoute} />

      {/* Route Information */}
      {hasRoute && vehicle?.route && (
        <div className='max-w-md mx-auto mb-6'>
          <div className='bg-linear-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white'>
            <div className='flex items-center gap-2 mb-3'>
              <MapPin className='w-5 h-5' />
              <h3 className='text-lg font-semibold'>Your Route</h3>
            </div>
            <div className='flex items-center justify-between'>
              <div className='text-center'>
                <div className='text-2xl font-bold'>{vehicle.route.origin}</div>
              </div>
              <div className='flex-1 flex items-center justify-center px-4'>
                <ArrowLeftRight className='w-8 h-8' />
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold'>
                  {vehicle.route.destination}
                </div>
              </div>
            </div>
            <div className='mt-4 text-center text-sm opacity-90'>
              E£{vehicle.route.pricePerSeat} per seat
              {vehicle.route.distance && ` • ${vehicle.route.distance} km`}
              {vehicle.route.duration && ` • ${vehicle.route.duration} min`}
            </div>
          </div>
        </div>
      )}

      {/* Active Ride Status */}
      {activeRide && (
        <div className='max-w-md mx-auto mb-6'>
          <Link href='/d/dashboard/active-ride'>
            <div className='bg-green-50 border-2 border-green-300 rounded-2xl p-6 hover:border-green-400 transition-all duration-200 cursor-pointer'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse' />
                <h3 className='text-lg font-bold text-green-800'>
                  Active Ride in Progress
                </h3>
              </div>
              <p className='text-sm text-green-700'>
                Direction:{' '}
                {activeRide.direction === 'FORWARD'
                  ? `${vehicle?.route?.origin} → ${vehicle?.route?.destination}`
                  : `${vehicle?.route?.destination} → ${vehicle?.route?.origin}`}
              </p>
              <p className='text-sm text-green-700 mt-1'>
                Available Seats: {activeRide.availableSeats}
              </p>
              <p className='text-sm text-green-700 mt-1'>
                Booked Seats:{' '}
                {vehicle?.capacity
                  ? vehicle.capacity - activeRide.availableSeats
                  : 0}
              </p>
              <p className='text-xs text-green-600 mt-2'>
                Started: {new Date(activeRide.departureTime).toLocaleString()}
              </p>
              <p className='text-sm text-green-700 mt-3 font-semibold text-center'>
                Click to view seats diagram →
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Main Action - Start Ride Button or Warning */}
      <div className='flex justify-center items-center mb-12'>
        {canStartRide ? (
          <div className='w-full max-w-md'>
            <h3 className='text-center text-lg font-semibold text-gray-700 mb-4'>
              Choose Direction & Start Ride
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <form action={startRide}>
                <input type='hidden' name='direction' value='FORWARD' />
                <Button
                  type='submit'
                  className='w-full h-40 rounded-2xl bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl text-white flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform duration-200'
                >
                  <Play className='w-12 h-12 fill-white' />
                  <div className='text-center'>
                    <div className='text-sm font-medium'>
                      {vehicle?.route?.origin}
                    </div>
                    <div className='text-xs'>↓</div>
                    <div className='text-sm font-medium'>
                      {vehicle?.route?.destination}
                    </div>
                  </div>
                </Button>
              </form>
              <form action={startRide}>
                <input type='hidden' name='direction' value='RETURN' />
                <Button
                  type='submit'
                  className='w-full h-40 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl text-white flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform duration-200'
                >
                  <Play className='w-12 h-12 fill-white' />
                  <div className='text-center'>
                    <div className='text-sm font-medium'>
                      {vehicle?.route?.destination}
                    </div>
                    <div className='text-xs'>↓</div>
                    <div className='text-sm font-medium'>
                      {vehicle?.route?.origin}
                    </div>
                  </div>
                </Button>
              </form>
            </div>
          </div>
        ) : activeRide ? (
          <div className='w-full max-w-md bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg'>
            <div className='flex flex-col items-center text-center gap-4'>
              <Play className='w-16 h-16 text-blue-600' />
              <h3 className='text-xl font-bold text-blue-800'>
                Ride In Progress
              </h3>
              <p className='text-base text-blue-700'>
                Complete your current ride before starting a new one
              </p>
            </div>
          </div>
        ) : (
          <div className='w-full max-w-md bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg'>
            <div className='flex flex-col items-center text-center gap-4'>
              <AlertCircle className='w-16 h-16 text-yellow-600' />
              <h3 className='text-xl font-bold text-yellow-800'>
                Setup Required
              </h3>
              <p className='text-base text-yellow-700'>
                {profileCompletion < 100
                  ? 'Please complete your profile first'
                  : !hasVehicle && !hasRoute
                  ? 'Please register your vehicle and route first'
                  : !hasVehicle
                  ? 'Please register your vehicle first'
                  : 'Please register your route first'}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
