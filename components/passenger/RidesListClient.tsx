'use client'

import React from 'react'
import Link from 'next/link'
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Booking {
  id: string
  status: string
  totalPrice: number
  createdAt: Date
  ride: {
    id: string
    direction: string
    departureTime: Date
    status: string
    route: {
      origin: string
      destination: string
      pricePerSeat: number
    }
  }
  seat: {
    seatNumber: number
  } | null
}

interface RidesListClientProps {
  bookings: Booking[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function RidesListClient({
  bookings,
  currentPage,
  totalPages,
  totalCount,
}: RidesListClientProps) {
  return (
    <div>
      {/* Stats Summary */}
      <div className='mb-6 bg-white rounded-xl shadow p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500'>Total Rides</p>
            <p className='text-2xl font-bold text-gray-800'>{totalCount}</p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-500'>Page</p>
            <p className='text-2xl font-bold text-blue-600'>
              {currentPage} / {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Rides List */}
      {bookings.length === 0 ? (
        <div className='bg-white rounded-2xl shadow-lg p-8 text-center'>
          <div className='text-gray-400 mb-4'>
            <MapPin className='w-16 h-16 mx-auto' />
          </div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            No rides found
          </h3>
          <p className='text-sm text-gray-500'>
            You don&apos;t have any rides yet
          </p>
        </div>
      ) : (
        <div className='space-y-3 mb-6'>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className='bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow'
            >
              {/* Status Badge */}
              <div className='flex items-center justify-between mb-3'>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {booking.status === 'CONFIRMED' ? (
                    <CheckCircle className='w-3 h-3' />
                  ) : booking.status === 'COMPLETED' ? (
                    <CheckCircle className='w-3 h-3' />
                  ) : (
                    <XCircle className='w-3 h-3' />
                  )}
                  {booking.status}
                </div>
                {booking.seat && (
                  <div className='bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold'>
                    Seat #{booking.seat.seatNumber}
                  </div>
                )}
              </div>

              {/* Route Info */}
              <div className='flex items-center gap-2 mb-3'>
                <MapPin className='w-5 h-5 text-gray-400 shrink-0' />
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-gray-800'>
                      {booking.ride.direction === 'FORWARD'
                        ? booking.ride.route.origin
                        : booking.ride.route.destination}
                    </span>
                    <span className='text-gray-400'>→</span>
                    <span className='font-semibold text-gray-800'>
                      {booking.ride.direction === 'FORWARD'
                        ? booking.ride.route.destination
                        : booking.ride.route.origin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className='flex items-center gap-2 mb-3 text-sm text-gray-600'>
                <Calendar className='w-4 h-4' />
                <span>
                  {new Date(booking.ride.departureTime).toLocaleDateString()}
                </span>
                <Clock className='w-4 h-4 ml-2' />
                <span>
                  {new Date(booking.ride.departureTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Price */}
              <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                <span className='text-sm text-gray-600'>Price</span>
                <span className='text-lg font-bold text-green-600'>
                  E£{booking.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between bg-white rounded-xl shadow p-4'>
          <Link
            href={`/p/dashboard/rides?page=${currentPage - 1}`}
            className={currentPage <= 1 ? 'pointer-events-none' : ''}
          >
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage <= 1}
              className='flex items-center gap-2'
            >
              <ChevronLeft className='w-4 h-4' />
              Previous
            </Button>
          </Link>

          <div className='flex items-center gap-2'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Link key={page} href={`/p/dashboard/rides?page=${page}`}>
                    <Button
                      variant={page === currentPage ? 'default' : 'outline'}
                      size='sm'
                      className='w-10 h-10'
                    >
                      {page}
                    </Button>
                  </Link>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className='text-gray-400'>
                    ...
                  </span>
                )
              }
              return null
            })}
          </div>

          <Link
            href={`/p/dashboard/rides?page=${currentPage + 1}`}
            className={currentPage >= totalPages ? 'pointer-events-none' : ''}
          >
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage >= totalPages}
              className='flex items-center gap-2'
            >
              Next
              <ChevronRight className='w-4 h-4' />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

