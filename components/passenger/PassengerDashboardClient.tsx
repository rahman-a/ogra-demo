'use client'

import React, { useState } from 'react'
import {
  Clock,
  MapPin,
  Wallet,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BarcodeScanner } from './BarcodeScanner'
import { PaymentModal } from './PaymentModal'
import { PassengerNavigation } from './PassengerNavigation'
import type { ScanResult } from '@/actions/ScanBarcode'
import { toast } from 'sonner'

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

interface PassengerDashboardClientProps {
  bookings: Booking[]
  walletBalance: number
}

export function PassengerDashboardClient({
  bookings,
  walletBalance,
}: PassengerDashboardClientProps) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleScanSuccess = (result: ScanResult) => {
    if (result.success && result.data) {
      if (result.autoBooked) {
        // Seat was automatically booked
        toast.success('🎉 Booking confirmed!', {
          description: `${result.message} - Refreshing dashboard...`,
          duration: 3000,
        })
        // Refresh the page to show updated bookings
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        // Show payment modal for insufficient balance or manual booking
        if (result.message.includes('Insufficient balance')) {
          toast.warning('Insufficient balance', {
            description: 'Please charge your wallet to complete booking.',
            duration: 5000,
          })
        }
        setScanResult(result)
        setShowPaymentModal(true)
      }
    }
  }

  const handleScanError = (errorMessage: string) => {
    // Toast is already shown in BarcodeScanner component
    // This is just for additional handling if needed
    console.error('Scan error:', errorMessage)
  }

  const handlePaymentClose = () => {
    setShowPaymentModal(false)
    setScanResult(null)
  }

  // Calculate stats
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED')
  const totalSpent = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white p-4 pb-20'>
      {/* Header */}
      <div className='mb-6 pt-4'>
        <h1 className='text-2xl font-bold text-gray-800 text-center'>
          Passenger Dashboard
        </h1>
        <p className='text-center text-gray-600 mt-2'>
          Book your ride and track your journeys
        </p>
      </div>

      {/* Wallet Balance */}
      <div className='max-w-md mx-auto mb-6'>
        <div className='bg-linear-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Wallet className='w-5 h-5' />
                <span className='text-sm opacity-90'>Wallet Balance</span>
              </div>
              <div className='text-3xl font-bold'>
                E£{walletBalance.toFixed(2)}
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = '/p/dashboard/wallet')}
              className='bg-white text-green-600 hover:bg-green-50'
            >
              Charge
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='max-w-md mx-auto mb-6 grid grid-cols-3 gap-3'>
        <div className='bg-white rounded-xl shadow p-4 text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {activeBookings.length}
          </div>
          <div className='text-xs text-gray-500 mt-1'>Active</div>
        </div>
        <div className='bg-white rounded-xl shadow p-4 text-center'>
          <div className='text-2xl font-bold text-blue-600'>
            {completedBookings.length}
          </div>
          <div className='text-xs text-gray-500 mt-1'>Completed</div>
        </div>
        <div className='bg-white rounded-xl shadow p-4 text-center'>
          <div className='text-2xl font-bold text-purple-600'>
            {totalSpent.toFixed(0)}
          </div>
          <div className='text-xs text-gray-500 mt-1'>Total E£</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <PassengerNavigation />

      {/* Barcode Scanner Button */}
      <div className='max-w-md mx-auto mb-6'>
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
        />
      </div>

      {/* Recent Rides */}
      <div className='max-w-md mx-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold text-gray-800'>Recent Rides</h2>
          {bookings.length > 3 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => (window.location.href = '/p/dashboard/rides')}
              className='text-blue-600 hover:text-blue-700'
            >
              View All →
            </Button>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-lg p-8 text-center'>
            <div className='text-gray-400 mb-4'>
              <MapPin className='w-16 h-16 mx-auto' />
            </div>
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>
              No rides yet
            </h3>
            <p className='text-sm text-gray-500'>
              Scan a barcode to book your first ride
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {bookings.slice(0, 3).map((booking) => (
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
                    {new Date(booking.ride.departureTime).toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
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
      </div>

      {/* Payment Modal */}
      {scanResult?.data && scanResult.data.activeRide && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          rideData={{
            ...scanResult.data,
            activeRide: scanResult.data.activeRide,
          }}
          walletBalance={walletBalance}
        />
      )}
    </div>
  )
}
