'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

type PaymentMethod =
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'INSTAPAY'
  | 'VODAFONE_CASH'
  | 'ETISALAT_CASH'
  | 'ORANGE_CASH'

export async function chargeWallet(formData: FormData) {
  const lng = await getLocaleFromCookies()
  const { t } = await getTranslation(lng, 'actions')
  const session = await auth()

  if (!session || !session.user) {
    throw new Error(t('errors.mustBeLoggedIn'))
  }

  const amount = formData.get('amount') as string
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  if (!amount || !paymentMethod) {
    throw new Error(t('errors.amountAndPaymentMethodRequired'))
  }

  const amountNum = parseFloat(amount)
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error(t('errors.amountMustBePositive'))
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
    throw new Error(t('errors.invalidPaymentMethod'))
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
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return {
      success: true,
      message: t('success.chargeSuccess', { amount: amountNum.toFixed(2) }),
    }
  } catch (error) {
    console.error('Charge wallet error:', error)
    throw error
  }
}
