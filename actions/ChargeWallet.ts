'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type PaymentMethod =
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'INSTAPAY'
  | 'VODAFONE_CASH'
  | 'ETISALAT_CASH'
  | 'ORANGE_CASH'

export async function chargeWallet(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    throw new Error('You must be logged in')
  }

  const amount = formData.get('amount') as string
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  if (!amount || !paymentMethod) {
    throw new Error('Amount and payment method are required')
  }

  const amountNum = parseFloat(amount)
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Amount must be a positive number')
  }

  // Validate payment method
  const validMethods = [
    'DEBIT_CARD',
    'CREDIT_CARD',
    'INSTAPAY',
    'VODAFONE_CASH',
    'ETISALAT_CASH',
    'ORANGE_CASH',
  ]
  if (!validMethods.includes(paymentMethod)) {
    throw new Error('Invalid payment method')
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = await tx.wallet.create({
          data: {
            userId: session.user.id,
            balance: 0,
          },
        })
      }

      const balanceBefore = wallet.balance
      const balanceAfter = balanceBefore + amountNum

      // Update wallet balance
      await tx.wallet.update({
        where: { userId: session.user.id },
        data: { balance: balanceAfter },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'DEPOSIT',
          amount: amountNum,
          description: `Deposit via ${paymentMethod.replace('_', ' ')}`,
          paymentMethod,
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
      message: `Successfully added ${amountNum.toFixed(2)} EGP to your wallet`,
    }
  } catch (error) {
    console.error('Charge wallet error:', error)
    throw error
  }
}
