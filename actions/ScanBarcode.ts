'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface BarcodeData {
  routeId: string
  seatId?: string
}

export interface ScanResult {
  success: boolean
  message: string
  autoBooked?: boolean
  data?: {
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
    } | null
    seat?: {
      id: string
      seatNumber: number
      status: string
    }
    booking?: {
      id: string
      totalPrice: number
    }
  }
}

export async function scanBarcode(
  barcodeData: string,
  autoBook: boolean = true
): Promise<ScanResult> {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return {
        success: false,
        message: 'You must be logged in to scan barcodes',
      }
    }

    // Parse barcode data (format: routeId:seatId)
    let parsedData: BarcodeData
    try {
      // Try to parse as JSON first
      parsedData = JSON.parse(barcodeData)
    } catch {
      // If not JSON, try simple format: routeId:seatId
      const parts = barcodeData.split(':')
      parsedData = {
        routeId: parts[0],
        seatId: parts[1] || undefined,
      }
    }

    const { routeId, seatId } = parsedData

    if (!routeId) {
      return {
        success: false,
        message: 'Invalid barcode format. Expected format: routeId:seatId',
      }
    }

    if (!seatId) {
      return {
        success: false,
        message: 'Seat ID missing in barcode. Expected format: routeId:seatId',
      }
    }

    // Get route information
    const route = await prisma.route.findUnique({
      where: { id: routeId, deletedAt: null },
      include: {
        vehicle: {
          include: {
            seats: seatId
              ? {
                  where: {
                    id: seatId,
                  },
                }
              : true,
          },
        },
        rides: {
          where: {
            status: 'ACTIVE',
            deletedAt: null,
          },
          orderBy: {
            departureTime: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!route) {
      return {
        success: false,
        message: 'Route not found or inactive',
      }
    }

    // Check for active ride
    const activeRide = route.rides.length > 0 ? route.rides[0] : null

    if (!activeRide) {
      return {
        success: false,
        message: 'No active ride found for this route',
      }
    }

    // Check if user already has a booking for this ride
    const existingBooking = await prisma.booking.findFirst({
      where: {
        rideId: activeRide.id,
        passengerId: session.user.id,
        status: 'CONFIRMED',
        deletedAt: null,
      },
    })

    if (existingBooking) {
      return {
        success: false,
        message: 'You already have a booking for this ride',
      }
    }

    // If seat ID is provided, validate it
    let seat = undefined
    if (seatId) {
      const foundSeat = route.vehicle.seats.find((s) => s.id === seatId)
      if (!foundSeat) {
        return {
          success: false,
          message: 'Seat not found',
        }
      }

      // Check if seat is already booked for this ride
      const seatBooking = await prisma.booking.findFirst({
        where: {
          rideId: activeRide.id,
          seatId: foundSeat.id,
          status: 'CONFIRMED',
          deletedAt: null,
        },
      })

      if (seatBooking) {
        return {
          success: false,
          message: `Seat #${foundSeat.seatNumber} is already booked`,
        }
      }

      if (foundSeat.seatNumber === 1) {
        return {
          success: false,
          message: 'Seat 1 is reserved for the driver',
        }
      }

      if (foundSeat.status !== 'AVAILABLE') {
        return {
          success: false,
          message: `Seat #${
            foundSeat.seatNumber
          } is ${foundSeat.status.toLowerCase()}`,
        }
      }

      seat = foundSeat
    }

    // Check if there are available seats
    if (activeRide.availableSeats <= 0) {
      return {
        success: false,
        message: 'No available seats on this ride',
      }
    }

    // If autoBook is enabled and seat is specified, check balance and book automatically
    if (autoBook && seat) {
      // Verify user exists first
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!userExists) {
        return {
          success: false,
          message: 'User session invalid. Please log in again.',
        }
      }

      // Get or create passenger's wallet
      let wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) {
        try {
          wallet = await prisma.wallet.create({
            data: {
              userId: session.user.id,
              balance: 0,
            },
          })
        } catch (error) {
          console.error('Wallet creation error:', error)
          return {
            success: false,
            message: 'Failed to create wallet. Please contact support.',
          }
        }
      }

      // Check wallet balance
      const bookingPrice = route.pricePerSeat
      if (wallet.balance >= bookingPrice) {
        // Automatically book the seat
        try {
          const booking = await prisma.$transaction(async (tx) => {
            // Create the booking
            const newBooking = await tx.booking.create({
              data: {
                rideId: activeRide.id,
                passengerId: session.user.id,
                seatId: seat!.id,
                totalPrice: bookingPrice,
                status: 'CONFIRMED',
              },
            })

            // Update seat status to occupied
            await tx.seat.update({
              where: { id: seat!.id },
              data: { status: 'OCCUPIED' },
            })

            // Update available seats count in ride
            await tx.ride.update({
              where: { id: activeRide.id },
              data: {
                availableSeats: {
                  decrement: 1,
                },
              },
            })

            // Deduct amount from passenger's wallet
            const balanceBefore = wallet!.balance
            const balanceAfter = balanceBefore - bookingPrice

            await tx.wallet.update({
              where: { userId: session.user.id },
              data: { balance: balanceAfter },
            })

            // Create transaction record for booking payment
            await tx.transaction.create({
              data: {
                userId: session.user.id,
                type: 'BOOKING_PAYMENT',
                amount: -bookingPrice,
                description: `Booking payment for seat #${seat!.seatNumber} - ${
                  route.origin
                } to ${route.destination}`,
                paymentMethod: 'WALLET_TRANSFER',
                status: 'COMPLETED',
                bookingId: newBooking.id,
                balanceBefore,
                balanceAfter,
              },
            })

            return newBooking
          })

          // Revalidate the dashboard
          revalidatePath('/p/dashboard')

          return {
            success: true,
            autoBooked: true,
            message: `Seat #${seat.seatNumber} booked successfully!`,
            data: {
              route: {
                id: route.id,
                origin: route.origin,
                destination: route.destination,
                pricePerSeat: route.pricePerSeat,
                distance: route.distance || undefined,
                duration: route.duration || undefined,
              },
              activeRide: {
                id: activeRide.id,
                direction: activeRide.direction,
                departureTime: activeRide.departureTime,
                availableSeats: activeRide.availableSeats - 1,
              },
              seat: {
                id: seat.id,
                seatNumber: seat.seatNumber,
                status: 'OCCUPIED',
              },
              booking: {
                id: booking.id,
                totalPrice: bookingPrice,
              },
            },
          }
        } catch (error) {
          console.error('Auto-booking error:', error)
          return {
            success: false,
            message: 'Failed to book seat automatically',
          }
        }
      } else {
        // Insufficient balance - return data for manual payment
        return {
          success: true,
          autoBooked: false,
          message: `Insufficient balance. Required: E£${bookingPrice.toFixed(
            2
          )}, Available: E£${wallet.balance.toFixed(2)}`,
          data: {
            route: {
              id: route.id,
              origin: route.origin,
              destination: route.destination,
              pricePerSeat: route.pricePerSeat,
              distance: route.distance || undefined,
              duration: route.duration || undefined,
            },
            activeRide: {
              id: activeRide.id,
              direction: activeRide.direction,
              departureTime: activeRide.departureTime,
              availableSeats: activeRide.availableSeats,
            },
            seat: {
              id: seat.id,
              seatNumber: seat.seatNumber,
              status: seat.status,
            },
          },
        }
      }
    }

    // Return validation data without booking
    return {
      success: true,
      autoBooked: false,
      message: 'Route and ride validated successfully',
      data: {
        route: {
          id: route.id,
          origin: route.origin,
          destination: route.destination,
          pricePerSeat: route.pricePerSeat,
          distance: route.distance || undefined,
          duration: route.duration || undefined,
        },
        activeRide: {
          id: activeRide.id,
          direction: activeRide.direction,
          departureTime: activeRide.departureTime,
          availableSeats: activeRide.availableSeats,
        },
        seat: seat
          ? {
              id: seat.id,
              seatNumber: seat.seatNumber,
              status: seat.status,
            }
          : undefined,
      },
    }
  } catch (error) {
    console.error('Scan barcode error:', error)
    return {
      success: false,
      message: 'Failed to process barcode',
    }
  }
}
