'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

export async function withdrawMoney(formData: FormData) {
  const lng = await getLocaleFromCookies()
  const { t } = await getTranslation(lng, 'actions')
  const session = await auth()

  if (!session || !session.user) {
    throw new Error(t('errors.mustBeLoggedIn'))
  }

  const amount = formData.get('amount') as string

  if (!amount) {
    throw new Error(t('errors.amountRequired'))
  }

  const amountNum = parseFloat(amount)
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error(t('errors.amountMustBePositive'))
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) {
        throw new Error(t('errors.walletNotFound'))
      }

      // Check if balance is sufficient
      if (wallet.balance < amountNum) {
        throw new Error(
          t('errors.insufficientBalanceAvailable', {
            available: wallet.balance.toFixed(2),
          })
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
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return {
      success: true,
      message: t('success.withdrawSuccess', { amount: amountNum.toFixed(2) }),
    }
  } catch (error) {
    console.error('Withdraw money error:', error)
    throw error
  }
}
