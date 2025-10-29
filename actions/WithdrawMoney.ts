'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function withdrawMoney(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('You must be logged in')
  }

  const amount = formData.get('amount') as string

  if (!amount) {
    throw new Error('Amount is required')
  }

  const amountNum = parseFloat(amount)
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Amount must be a positive number')
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) {
        throw new Error('Wallet not found. Please create a wallet first.')
      }

      // Check if balance is sufficient
      if (wallet.balance < amountNum) {
        throw new Error(
          `Insufficient balance. Available: ${wallet.balance.toFixed(2)} EGP`
        )
      }

      const balanceBefore = wallet.balance
      const balanceAfter = balanceBefore - amountNum

      // Update wallet balance
      await tx.wallet.update({
        where: { userId: session.user.id },
        data: { balance: balanceAfter },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'WITHDRAWAL',
          amount: -amountNum, // Negative for withdrawal
          description: 'ATM Withdrawal',
          paymentMethod: 'ATM',
          status: 'COMPLETED',
          balanceBefore,
          balanceAfter,
        },
      })
    })

    revalidatePath('/d/dashboard')
    revalidatePath('/p/dashboard')
    return {
      success: true,
      message: `Successfully withdrew ${amountNum.toFixed(
        2
      )} EGP from your wallet`,
    }
  } catch (error) {
    console.error('Withdraw money error:', error)
    throw error
  }
}
