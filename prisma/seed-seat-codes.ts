import { PrismaClient } from '@prisma/client'
import { generateSeatCode } from '../lib/generateSeatCode'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting seat code generation and population...')

  // Get all seats from the database
  const seats = await prisma.seat.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  })

  console.log(`📊 Found ${seats.length} seats to update`)

  let updatedCount = 0
  let skippedCount = 0
  const generatedCodes = new Set<string>()

  for (const seat of seats) {
    // Skip if seat already has a valid code
    if (seat.code && /^\d{14}$/.test(seat.code)) {
      console.log(`⏭️  Seat ${seat.id} already has a valid code: ${seat.code}`)
      skippedCount++
      continue
    }

    // Generate a unique code
    let code = generateSeatCode()

    // Ensure uniqueness within this batch
    while (generatedCodes.has(code)) {
      code = generateSeatCode()
    }
    generatedCodes.add(code)

    // Check if code already exists in database
    const existingCode = await prisma.seat.findUnique({
      where: { code },
    })

    if (existingCode) {
      // If code exists, generate a new one
      let retries = 0
      while (existingCode && retries < 10) {
        code = generateSeatCode()
        const checkExisting = await prisma.seat.findUnique({
          where: { code },
        })
        if (!checkExisting) break
        retries++
      }
    }

    // Update the seat with the new code
    await prisma.seat.update({
      where: { id: seat.id },
      data: { code },
    })

    console.log(
      `✅ Updated seat ${seat.id} (Seat #${seat.seatNumber}) with code: ${code}`
    )
    updatedCount++
  }

  console.log('\n📈 Summary:')
  console.log(`   ✅ Updated: ${updatedCount} seats`)
  console.log(`   ⏭️  Skipped: ${skippedCount} seats (already had valid codes)`)
  console.log(`   📊 Total: ${seats.length} seats`)
  console.log('\n🎉 Seat code population completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error populating seat codes:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
