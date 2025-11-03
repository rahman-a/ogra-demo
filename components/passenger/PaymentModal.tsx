'use client'

import React, { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Wallet, MapPin, ArrowRight, Loader2 } from 'lucide-react'
import { bookSeat } from '@/actions/BookSeat'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  rideData: {
    route: {
      id: string
      origin: string
      destination: string
      pricePerSeat: number
      distance?: number
      duration?: number
    }
    activeRide: {
      id: string
      direction: string
      departureTime: Date
      availableSeats: number
    }
    seat?: {
      id: string
      seatNumber: number
      status: string
    }
  }
  walletBalance?: number
}

export function PaymentModal({
  isOpen,
  onClose,
  rideData,
  walletBalance = 0,
}: PaymentModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePayment = async () => {
    setError(null)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('rideId', rideData.activeRide.id)
        if (rideData.seat) {
          formData.append('seatId', rideData.seat.id)
        }

        await bookSeat(formData)

        // Success - show toast and refresh
        toast.success('🎉 Payment successful!', {
          description: `Seat #${rideData.seat?.seatNumber} booked successfully`,
          duration: 4000,
        })

        onClose()

        // Refresh after a short delay
        setTimeout(() => {
          router.refresh()
        }, 500)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Payment failed'
        setError(errorMessage)

        toast.error('Payment failed', {
          description: errorMessage,
          duration: 5000,
        })
      }
    })
  }

  const hasEnoughBalance = walletBalance >= rideData.route.pricePerSeat

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>Confirm Booking</DialogTitle>
          <DialogDescription>
            Review your ride details and complete payment
          </DialogDescription>
        </DialogHeader>

        {/* Ride Details */}
        <div className='space-y-4 my-4'>
          {/* Route Info */}
          <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <MapPin className='w-5 h-5 text-green-600' />
              <span className='text-sm font-medium text-gray-600'>Route</span>
            </div>
            <div className='flex items-center justify-between'>
              <div className='text-lg font-bold text-gray-800'>
                {rideData.activeRide.direction === 'FORWARD'
                  ? rideData.route.origin
                  : rideData.route.destination}
              </div>
              <ArrowRight className='w-5 h-5 text-gray-400' />
              <div className='text-lg font-bold text-gray-800'>
                {rideData.activeRide.direction === 'FORWARD'
                  ? rideData.route.destination
                  : rideData.route.origin}
              </div>
            </div>
            {rideData.route.distance && (
              <p className='text-xs text-gray-500 mt-1'>
                {rideData.route.distance} km
                {rideData.route.duration && ` • ${rideData.route.duration} min`}
              </p>
            )}
          </div>

          {/* Seat Info */}
          {rideData.seat && (
            <div className='bg-purple-50 rounded-xl p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-600'>
                  Seat Number
                </span>
                <span className='text-2xl font-bold text-purple-600'>
                  #{rideData.seat.seatNumber}
                </span>
              </div>
            </div>
          )}

          {/* Price */}
          <div className='bg-gray-50 rounded-xl p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-600'>Price</span>
              <span className='text-2xl font-bold text-gray-800'>
                E£{rideData.route.pricePerSeat.toFixed(2)}
              </span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-500'>Your Wallet Balance</span>
              <span
                className={`font-semibold ${
                  hasEnoughBalance ? 'text-green-600' : 'text-red-600'
                }`}
              >
                E£{walletBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Departure Time */}
          <div className='text-sm text-gray-600 text-center'>
            Departure:{' '}
            {new Date(rideData.activeRide.departureTime).toLocaleString()}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        {/* Insufficient Balance Warning */}
        {!hasEnoughBalance && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
            <p className='text-sm text-yellow-800'>
              Insufficient wallet balance. Please charge your wallet first.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className='space-y-2'>
          {hasEnoughBalance ? (
            <Button
              onClick={handlePayment}
              disabled={isPending}
              className='w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            >
              {isPending ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className='w-5 h-5 mr-2' />
                  Pay E£{rideData.route.pricePerSeat.toFixed(2)} & Book
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/p/wallet')}
              className='w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            >
              <CreditCard className='w-5 h-5 mr-2' />
              Charge Wallet
            </Button>
          )}
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isPending}
            className='w-full'
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
