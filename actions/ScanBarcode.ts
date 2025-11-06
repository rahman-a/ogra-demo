'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

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
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    const session = await auth()

    if (!session || !session.user) {
      return {
        success: false,
        message: t('errors.mustBeLoggedInToScan'),
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
        message: t('errors.invalidBarcodeFormat'),
      }
    }

    if (!seatId) {
      return {
        success: false,
        message: t('errors.seatIdMissing'),
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
        message: t('errors.routeNotFound'),
      }
    }

    // Check for active ride
    const activeRide = route.rides.length > 0 ? route.rides[0] : null

    if (!activeRide) {
      return {
        success: false,
        message: t('errors.noActiveRide'),
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
        message: t('errors.alreadyHaveBooking'),
      }
    }

    // If seat ID is provided, validate it
    let seat = undefined
    if (seatId) {
      const foundSeat = route.vehicle.seats.find((s) => s.id === seatId)
      if (!foundSeat) {
        return {
          success: false,
          message: t('errors.seatNotFound'),
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
          message: t('errors.seatAlreadyBooked', { number: foundSeat.seatNumber }),
        }
      }

      if (foundSeat.seatNumber === 1) {
        return {
          success: false,
          message: t('errors.seatReservedForDriver'),
        }
      }

      if (foundSeat.status !== 'AVAILABLE') {
        return {
          success: false,
          message: t('errors.seatStatus', {
            number: foundSeat.seatNumber,
            status: foundSeat.status.toLowerCase(),
          }),
        }
      }

      seat = foundSeat
    }

    // Check if there are available seats
    if (activeRide.availableSeats <= 0) {
      return {
        success: false,
        message: t('errors.noAvailableSeats'),
      }
    }

    // If autoBook is enabled and seat is specified, check balance and book automatically
    if (autoBook && seat) {
      return await bookSeat(session.user.id, activeRide, route, seat)
    }

    // Return validation data without booking
    return {
      success: true,
      autoBooked: false,
      message: t('success.routeAndRideValidated'),
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
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return {
      success: false,
      message: t('errors.failedToProcessBarcode'),
    }
  }
}

// Helper function to book a seat
async function bookSeat(
  userId: string,
  activeRide: any,
  route: any,
  seat: any
): Promise<ScanResult> {
  const lng = await getLocaleFromCookies()
  const { t } = await getTranslation(lng, 'actions')
  
  // Verify user exists first
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!userExists) {
    return {
      success: false,
      message: t('errors.userSessionInvalid'),
    }
  }

  // Get or create passenger's wallet
  let wallet = await prisma.wallet.findUnique({
    where: { userId: userId },
  })

  if (!wallet) {
    try {
      wallet = await prisma.wallet.create({
        data: {
          userId: userId,
          balance: 0,
        },
      })
    } catch (error) {
      console.error('Wallet creation error:', error)
      return {
        success: false,
        message: t('errors.failedToCreateWallet'),
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
            passengerId: userId,
            seatId: seat.id,
            totalPrice: bookingPrice,
            status: 'CONFIRMED',
          },
        })

        // Update seat status to occupied
        await tx.seat.update({
          where: { id: seat.id },
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
          where: { userId: userId },
          data: { balance: balanceAfter },
        })

        // Create transaction record for booking payment
        await tx.transaction.create({
          data: {
            userId: userId,
            type: 'BOOKING_PAYMENT',
            amount: -bookingPrice,
            description: `Booking payment for seat #${seat.seatNumber} - ${route.origin} to ${route.destination}`,
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
        message: t('success.seatBooked', { number: seat.seatNumber }),
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
        message: t('errors.failedToBookSeat'),
      }
    }
  } else {
    // Insufficient balance - return data for manual payment
    return {
      success: true,
      autoBooked: false,
      message: t('errors.insufficientBalance', {
        required: bookingPrice.toFixed(2),
        available: wallet.balance.toFixed(2),
      }),
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

// New function: Book by seat code (14-digit code)
export async function bookBySeatCode(
  seatCode: string,
  autoBook: boolean = true
): Promise<ScanResult> {
  try {
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    const session = await auth()

    if (!session || !session.user) {
      return {
        success: false,
        message: t('errors.mustBeLoggedInToBook'),
      }
    }

    // Validate seat code format (should be 14 characters)
    if (!seatCode || seatCode.length !== 14) {
      return {
        success: false,
        message: t('errors.invalidSeatCode'),
      }
    }

    // Find seat by code
    const seat = await prisma.seat.findUnique({
      where: { code: seatCode, deletedAt: null },
      include: {
        vehicle: {
          include: {
            route: {
              include: {
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
            },
          },
        },
      },
    })

    if (!seat) {
      return {
        success: false,
        message: t('errors.seatNotFoundCheckCode'),
      }
    }

    const route = seat.vehicle.route

    if (!route) {
      return {
        success: false,
        message: t('errors.noRouteForVehicle'),
      }
    }

    // Check for active ride
    const activeRide = route.rides.length > 0 ? route.rides[0] : null

    if (!activeRide) {
      return {
        success: false,
        message: t('errors.noActiveRideForRoute'),
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
        message: t('errors.alreadyHaveBooking'),
      }
    }

    // Check if seat is already booked for this ride
    const seatBooking = await prisma.booking.findFirst({
      where: {
        rideId: activeRide.id,
        seatId: seat.id,
        status: 'CONFIRMED',
        deletedAt: null,
      },
    })

    if (seatBooking) {
      return {
        success: false,
        message: t('errors.seatAlreadyBooked', { number: seat.seatNumber }),
      }
    }

    if (seat.seatNumber === 1) {
      return {
        success: false,
        message: t('errors.seatReservedForDriver'),
      }
    }

    if (seat.status !== 'AVAILABLE') {
      return {
        success: false,
        message: t('errors.seatStatus', {
          number: seat.seatNumber,
          status: seat.status.toLowerCase(),
        }),
      }
    }

    // Check if there are available seats
    if (activeRide.availableSeats <= 0) {
      return {
        success: false,
        message: t('errors.noAvailableSeats'),
      }
    }

    // If autoBook is enabled, book the seat
    if (autoBook) {
      return await bookSeat(session.user.id, activeRide, route, seat)
    }

    // Return validation data without booking
    return {
      success: true,
      autoBooked: false,
      message: t('success.seatValidated'),
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
  } catch (error) {
    console.error('Book by seat code error:', error)
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return {
      success: false,
      message: t('errors.failedToProcessSeatCode'),
    }
  }
}

// New function: Book by plate number
export async function bookByPlateNumber(
  plateNumber: string,
  seatNumber: number,
  autoBook: boolean = true
): Promise<ScanResult> {
  try {
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    const session = await auth()

    if (!session || !session.user) {
      return {
        success: false,
        message: t('errors.mustBeLoggedInToBook'),
      }
    }

    // Validate plate number
    if (!plateNumber || plateNumber.trim().length === 0) {
      return {
        success: false,
        message: t('errors.invalidPlateNumber'),
      }
    }

    // Validate seat number
    if (!seatNumber || seatNumber < 1) {
      return {
        success: false,
        message: t('errors.invalidSeatNumber'),
      }
    }

    // Find vehicle by plate number
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        vehicleNumber: plateNumber.trim().toUpperCase(),
        deletedAt: null,
      },
      include: {
        route: {
          include: {
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
        },
        seats: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            seatNumber: 'asc',
          },
        },
      },
    })

    if (!vehicle) {
      return {
        success: false,
        message: t('errors.vehicleNotFound'),
      }
    }

    const route = vehicle.route

    if (!route) {
      return {
        success: false,
        message: t('errors.noRouteForVehicle'),
      }
    }

    // Check for active ride
    const activeRide = route.rides.length > 0 ? route.rides[0] : null

    if (!activeRide) {
      return {
        success: false,
        message: t('errors.noActiveRideForRoute'),
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
        message: t('errors.alreadyHaveBooking'),
      }
    }

    // Find the requested seat by seat number
    const selectedSeat = vehicle.seats.find((s) => s.seatNumber === seatNumber)

    if (!selectedSeat) {
      return {
        success: false,
        message: t('errors.seatNotFoundOnVehicle', { number: seatNumber }),
      }
    }

    // Validate the selected seat
    if (selectedSeat.seatNumber === 1) {
      return {
        success: false,
        message: t('errors.seatReservedForDriver'),
      }
    }

    if (selectedSeat.status !== 'AVAILABLE') {
      return {
        success: false,
        message: t('errors.seatStatus', {
          number: selectedSeat.seatNumber,
          status: selectedSeat.status.toLowerCase(),
        }),
      }
    }

    // Check if seat is already booked for this ride
    const seatBooking = await prisma.booking.findFirst({
      where: {
        rideId: activeRide.id,
        seatId: selectedSeat.id,
        status: 'CONFIRMED',
        deletedAt: null,
      },
    })

    if (seatBooking) {
      return {
        success: false,
        message: t('errors.seatAlreadyBooked', { number: selectedSeat.seatNumber }),
      }
    }

    // If autoBook is enabled, book the seat
    if (autoBook) {
      return await bookSeat(session.user.id, activeRide, route, selectedSeat)
    }

    // Return validation data with selected seat
    return {
      success: true,
      autoBooked: false,
      message: t('success.seatValidated'),
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
          id: selectedSeat.id,
          seatNumber: selectedSeat.seatNumber,
          status: selectedSeat.status,
        },
      },
    }
  } catch (error) {
    console.error('Book by plate number error:', error)
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return {
      success: false,
      message: t('errors.failedToProcessPlateNumber'),
    }
  }
}
