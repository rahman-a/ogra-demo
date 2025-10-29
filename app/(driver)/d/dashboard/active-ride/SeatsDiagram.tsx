'use client'

import React from 'react'
import { User } from 'lucide-react'

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
}

export function SeatsDiagram({ seats, bookings, capacity }: Props) {
  // Calculate seats per row (typical bus/van layout)
  const seatsPerRow = capacity <= 7 ? 2 : 4 // 2 columns for small vehicles, 4 for larger

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

  return (
    <div className='w-full max-w-2xl mx-auto'>
      {/* Legend */}
      <div className='flex justify-center gap-4 mb-6 text-sm flex-wrap'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-gray-600 rounded border-2 border-gray-700' />
          <span className='text-gray-700'>Driver</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-red-500 rounded border-2 border-red-600' />
          <span className='text-gray-700'>Available</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-green-500 rounded border-2 border-green-600' />
          <span className='text-gray-700'>Occupied</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-gray-400 rounded border-2 border-gray-500' />
          <span className='text-gray-700'>Maintenance</span>
        </div>
      </div>

      {/* Vehicle Front Indicator */}
      <div className='flex justify-center mb-4'>
        <div className='bg-gray-800 text-white px-6 py-2 rounded-t-xl text-sm font-semibold'>
          FRONT
        </div>
      </div>

      {/* Seats Grid */}
      <div className='bg-white rounded-2xl shadow-xl p-6 border-4 border-gray-300'>
        <div className='space-y-4'>
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className='grid gap-4'
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
                    className={`
                      relative aspect-square rounded-lg border-2 
                      ${getSeatColor(seat)}
                      transition-all duration-200 
                      flex flex-col items-center justify-center
                      ${
                        seat.status === 'AVAILABLE' && !isDriverSeat
                          ? 'cursor-pointer shadow-md'
                          : 'shadow-sm'
                      }
                    `}
                  >
                    {/* Seat Number */}
                    <div className='absolute top-1 left-1 bg-white/90 text-gray-800 text-xs font-bold rounded px-1.5 py-0.5'>
                      {seat.seatNumber}
                    </div>

                    {/* Driver Seat Label */}
                    {isDriverSeat ? (
                      <div className='flex flex-col items-center justify-center text-white text-center'>
                        <User className='w-8 h-8 mb-1' />
                        <span className='text-xs font-bold'>DRIVER</span>
                      </div>
                    ) : isOccupied && passengerName ? (
                      /* Passenger Info */
                      <div className='flex flex-col items-center justify-center text-white text-center px-2'>
                        <User className='w-6 h-6 mb-1' />
                        <span className='text-xs font-semibold leading-tight'>
                          {passengerName.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      /* Available Seat Icon */
                      <div className='text-white'>
                        <User className='w-8 h-8' />
                      </div>
                    )}

                    {/* Maintenance Label */}
                    {seat.status === 'ON_MAINTENANCE' && !isDriverSeat && (
                      <div className='absolute bottom-1 text-xs text-white font-semibold'>
                        Maintenance
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
          BACK
        </div>
      </div>
    </div>
  )
}
