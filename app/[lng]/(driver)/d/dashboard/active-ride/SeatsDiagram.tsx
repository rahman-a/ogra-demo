'use client'

import React, { useState } from 'react'
import CarSeat from '@/icons/CarSeat'
import ChildSeatFilled from '@/icons/CarSeatFilled'
import { Button } from '@/components/ui/button'
import { DollarSign, X, Loader2 } from 'lucide-react'
import { createManualBooking } from '@/actions/ManualBooking'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

type Seat = {
  id: string
  seatNumber: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'ON_MAINTENANCE'
}

type Booking = {
  id: string
  seatId: string | null
  passenger: {
    name: string
    email: string
  }
  status: string
}

type Props = {
  seats: Seat[]
  bookings: Booking[]
  capacity: number
  rideId: string
  pricePerSeat: number
  lng: Locale
}

export function SeatsDiagram({
  seats,
  bookings,
  rideId,
  pricePerSeat,
  lng,
}: Props) {
  const { t } = useTranslation(lng, 'dashboard')
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [loading, setLoading] = useState(false)
  // Fixed layout: 3 seats per row
  const seatsPerRow = 3

  // Group seats into rows
  const rows: Seat[][] = []
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    rows.push(seats.slice(i, i + seatsPerRow))
  }

  // Get passenger name for a seat
  const getPassengerForSeat = (seatId: string) => {
    const booking = bookings.find(
      (b) => b.seatId === seatId && b.status === 'CONFIRMED'
    )
    return booking?.passenger.name
  }

  // Get seat status color
  const getSeatColor = (seat: Seat) => {
    // Driver seat (seat #1) is always blue
    if (seat.seatNumber === 1) {
      return 'bg-gray-600 border-gray-700'
    }

    switch (seat.status) {
      case 'AVAILABLE':
        return 'bg-red-500 hover:bg-red-600 border-red-600'
      case 'OCCUPIED':
        return 'bg-green-500 border-green-600'
      case 'ON_MAINTENANCE':
        return 'bg-gray-400 border-gray-500'
      default:
        return 'bg-red-500 border-red-600'
    }
  }

  // Handle seat click for manual booking
  const handleSeatClick = (seat: Seat) => {
    // Only allow clicking available seats (not driver seat)
    if (seat.status === 'AVAILABLE' && seat.seatNumber !== 1) {
      setSelectedSeat(seat)
    }
  }

  // Handle manual booking confirmation
  const handleConfirmManualBooking = async () => {
    if (!selectedSeat) return

    setLoading(true)
    const loadingToast = toast.loading(t('activeRide.seats.markingAsPaid'))

    try {
      const result = await createManualBooking(rideId, selectedSeat.id)

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success(t('activeRide.seats.success'), {
          description: result.message,
          duration: 5000,
        })
        setSelectedSeat(null)
      } else {
        toast.error(t('activeRide.seats.failed'), {
          description: result.message,
          duration: 5000,
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(t('activeRide.seats.error'), {
        description: t('activeRide.seats.processingError'),
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    if (!loading) {
      setSelectedSeat(null)
    }
  }

  return (
    <div className='w-full max-w-2xl mx-auto'>
      {/* Legend */}
      <div className='flex justify-center gap-4 mb-6 text-sm flex-wrap'>
        <div className='flex items-center gap-2'>
          <ChildSeatFilled className='w-5 h-5 fill-gray-600' />
          <span className='text-gray-700'>{t('activeRide.seats.driver')}</span>
        </div>
        <div className='flex items-center gap-2'>
          <ChildSeatFilled className='w-5 h-5 fill-red-500' />
          <span className='text-gray-700'>
            {t('activeRide.seats.available')}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <ChildSeatFilled className='w-5 h-5 fill-green-500' />
          <span className='text-gray-700'>
            {t('activeRide.seats.occupied')}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <ChildSeatFilled className='w-5 h-5 fill-gray-400' />
          <span className='text-gray-700'>
            {t('activeRide.seats.maintenance')}
          </span>
        </div>
      </div>

      {/* Vehicle Front Indicator */}
      <div className='flex justify-center mb-4'>
        <div className='bg-gray-800 text-white px-6 py-2 rounded-t-xl text-sm font-semibold'>
          {t('activeRide.seats.front')}
        </div>
      </div>

      {/* Seats Grid */}
      <div className='bg-white rounded-2xl shadow-xl p-6 border-4 border-gray-300 max-w-md mx-auto'>
        <div className='space-y-3'>
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className='grid gap-3'
              style={{
                gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))`,
              }}
            >
              {row.map((seat) => {
                const passengerName = getPassengerForSeat(seat.id)
                const isOccupied = seat.status === 'OCCUPIED'
                const isDriverSeat = seat.seatNumber === 1

                return (
                  <div
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`
                      relative aspect-square max-w-[90px] mx-auto rounded-2xl 
                      ${getSeatColor(seat)}
                      transition-all duration-200 
                      flex flex-col items-center justify-center
                      ${
                        seat.status === 'AVAILABLE' && !isDriverSeat
                          ? 'cursor-pointer shadow-md hover:scale-105 active:scale-95'
                          : 'shadow-sm'
                      }
                    `}
                  >
                    {/* Seat Number Badge */}
                    <div className='absolute top-1 left-1 bg-white/95 text-gray-800 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-10'>
                      {seat.seatNumber}
                    </div>

                    {/* Driver Seat */}
                    {isDriverSeat ? (
                      <div className='flex flex-col items-center justify-center text-white text-center size-20'>
                        <ChildSeatFilled className='size-12 fill-current' />
                        <span className='text-[10px] font-bold mt-0.5'>
                          {t('activeRide.seats.driver').toUpperCase()}
                        </span>
                      </div>
                    ) : isOccupied && passengerName ? (
                      /* Occupied Seat - User Sitting on Chair */
                      <div className='flex flex-col items-center justify-center text-white text-center px-1 size-20'>
                        <ChildSeatFilled className='size-12 fill-current' />
                        <span className='text-[10px] font-semibold leading-tight bg-white/20 px-1.5 py-0.5 rounded-full mt-0.5'>
                          {passengerName.split(' ')[0]}
                        </span>
                      </div>
                    ) : seat.status === 'AVAILABLE' ? (
                      /* Available Empty Chair */
                      <div className='flex flex-col items-center justify-center text-white size-20'>
                        <ChildSeatFilled className='size-12 fill-current' />
                        <span className='text-[10px] font-medium mt-0.5 opacity-80'>
                          {t('activeRide.seats.empty')}
                        </span>
                      </div>
                    ) : (
                      /* Maintenance Chair */
                      <div className='flex flex-col items-center justify-center text-white size-20'>
                        <CarSeat className='size-12 fill-current' />
                        <span className='text-[10px] font-semibold mt-0.5'>
                          {t('activeRide.seats.maintenance')}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Back Indicator */}
      <div className='flex justify-center mt-4'>
        <div className='bg-gray-800 text-white px-6 py-2 rounded-b-xl text-sm font-semibold'>
          {t('activeRide.seats.back')}
        </div>
      </div>

      {/* Click Instruction */}
      <div className='text-center mt-4 text-sm text-gray-600'>
        <p className='font-medium'>{t('activeRide.seats.clickInstruction')}</p>
      </div>

      {/* Manual Booking Confirmation Modal */}
      {selectedSeat && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-gray-800'>
                {t('activeRide.seats.confirmCashPayment')}
              </h3>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleCloseModal}
                disabled={loading}
                className='rounded-full'
              >
                <X className='w-6 h-6' />
              </Button>
            </div>

            <div className='mb-6'>
              <div className='bg-blue-50 rounded-xl p-4 mb-4'>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-blue-600 mb-1'>
                    {t('activeRide.seats.seatNumber', {
                      number: selectedSeat.seatNumber,
                    })}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {t('activeRide.seats.payingInCash')}
                  </div>
                </div>
              </div>

              <div className='bg-green-50 rounded-xl p-4 border-2 border-green-200'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-700 font-medium'>
                    {t('activeRide.seats.amount')}
                  </span>
                  <span className='text-2xl font-bold text-green-600'>
                    {lng === 'ar'
                      ? `${pricePerSeat.toFixed(2)} ${t('currency.symbol')}`
                      : `${t('currency.symbol')}${pricePerSeat.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <p className='text-sm text-gray-500 mt-4 text-center'>
                {t('activeRide.seats.confirmDescription', {
                  amount:
                    lng === 'ar'
                      ? `${pricePerSeat.toFixed(2)} ${t('currency.symbol')}`
                      : `${t('currency.symbol')}${pricePerSeat.toFixed(2)}`,
                })}
              </p>
            </div>

            <div className='space-y-2'>
              <Button
                onClick={handleConfirmManualBooking}
                disabled={loading}
                className='w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold'
              >
                {loading ? (
                  <>
                    <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                    {t('activeRide.seats.processing')}
                  </>
                ) : (
                  <>
                    <DollarSign className='w-5 h-5 mr-2' />
                    {t('activeRide.seats.confirmPaymentReceived')}
                  </>
                )}
              </Button>
              <Button
                onClick={handleCloseModal}
                disabled={loading}
                variant='outline'
                className='w-full h-12'
              >
                {t('activeRide.seats.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
