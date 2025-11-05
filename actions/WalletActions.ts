'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface WalletActionResult {
  success: boolean
  message: string
  newBalance?: number
}

// Test function to add funds to wallet (no actual payment processing)
export async function addFundsToWallet(
  amount: number
): Promise<WalletActionResult> {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return {
        success: false,
        message: 'You must be logged in to add funds',
      }
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return {
        success: false,
        message: 'Please enter a valid amount greater than 0',
      }
    }

    if (amount > 10000) {
      return {
        success: false,
        message: 'Maximum charge amount is E£10,000',
      }
    }

    try {
      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId: session.user.id,
            balance: 0,
          },
        })
      }

      // Add funds in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const balanceBefore = wallet!.balance
        const balanceAfter = balanceBefore + amount

        // Update wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { userId: session.user.id },
          data: { balance: balanceAfter },
        })

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'DEPOSIT',
            amount: amount,
            description: `Test wallet charge - Added E£${amount.toFixed(2)}`,
            paymentMethod: null, // Test mode - no actual payment method
            status: 'COMPLETED',
            balanceBefore,
            balanceAfter,
          },
        })

        return updatedWallet
      })

      // Revalidate wallet pages
      revalidatePath('/p/dashboard/wallet')
      revalidatePath('/p/dashboard')

      return {
        success: true,
        message: `Successfully added E£${amount.toFixed(2)} to your wallet!`,
        newBalance: result.balance,
      }
    } catch (error) {
      console.error('Add funds error:', error)
      return {
        success: false,
        message: 'Failed to add funds. Please try again.',
      }
    }
  } catch (error) {
    console.error('Add funds error:', error)
    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}

// Get wallet balance and recent transactions
export async function getWalletData() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return null
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
        },
      })
    }

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return {
      balance: wallet.balance,
      transactions,
    }
  } catch (error) {
    console.error('Get wallet data error:', error)
    return null
  }
}

