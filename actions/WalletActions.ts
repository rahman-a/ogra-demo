'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

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
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    const session = await auth()

    if (!session || !session.user) {
      return {
        success: false,
        message: t('errors.mustBeLoggedInToAddFunds'),
      }
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return {
        success: false,
        message: t('errors.invalidAmount'),
      }
    }

    if (amount > 10000) {
      return {
        success: false,
        message: t('errors.maxChargeAmount'),
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
        message: t('success.fundsAdded', { amount: amount.toFixed(2) }),
        newBalance: result.balance,
      }
    } catch (error) {
      console.error('Add funds error:', error)
      return {
        success: false,
        message: t('errors.failedToAddFunds'),
      }
    }
  } catch (error) {
    console.error('Add funds error:', error)
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return {
      success: false,
      message: t('errors.unexpectedError'),
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

