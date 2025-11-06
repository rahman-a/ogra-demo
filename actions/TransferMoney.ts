'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getTranslation } from '@/i18n'
import { getLocaleFromCookies } from '@/lib/get-locale'

type TransferDestination =
  | 'WALLET'
  | 'VODAFONE_CASH'
  | 'ETISALAT_CASH'
  | 'ORANGE_CASH'

export async function transferMoney(formData: FormData) {
  const lng = await getLocaleFromCookies()
  const { t } = await getTranslation(lng, 'actions')
  const session = await auth()

  if (!session || !session.user) {
    throw new Error(t('errors.mustBeLoggedIn'))
  }

  const amount = formData.get('amount') as string
  const destination = formData.get('destination') as TransferDestination
  const recipientIdentifier = formData.get('recipientIdentifier') as string // Email for wallet, phone for e-wallet

  if (!amount || !destination || !recipientIdentifier) {
    throw new Error(t('errors.amountDestinationRecipientRequired'))
  }

  const amountNum = parseFloat(amount)
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error(t('errors.amountMustBePositive'))
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get sender's wallet
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!senderWallet) {
        throw new Error(t('errors.walletNotFound'))
      }

      // Check if balance is sufficient
      if (senderWallet.balance < amountNum) {
        throw new Error(
          t('errors.insufficientBalanceAvailable', {
            available: senderWallet.balance.toFixed(2),
          })
        )
      }

      const senderBalanceBefore = senderWallet.balance
      const senderBalanceAfter = senderBalanceBefore - amountNum

      if (destination === 'WALLET') {
        // Transfer to another user's wallet
        const recipient = await tx.user.findUnique({
          where: { email: recipientIdentifier },
          include: { wallet: true },
        })

        if (!recipient) {
          throw new Error(t('errors.recipientNotFound'))
        }

        if (recipient.id === session.user.id) {
          throw new Error(t('errors.cannotTransferToYourself'))
        }

        // Get or create recipient's wallet
        let recipientWallet = recipient.wallet
        if (!recipientWallet) {
          recipientWallet = await tx.wallet.create({
            data: {
              userId: recipient.id,
              balance: 0,
            },
          })
        }

        const recipientBalanceBefore = recipientWallet.balance
        const recipientBalanceAfter = recipientBalanceBefore + amountNum

        // Update sender's wallet
        await tx.wallet.update({
          where: { userId: session.user.id },
          data: { balance: senderBalanceAfter },
        })

        // Update recipient's wallet
        await tx.wallet.update({
          where: { userId: recipient.id },
          data: { balance: recipientBalanceAfter },
        })

        // Create sender's transaction record
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'TRANSFER_OUT',
            amount: -amountNum,
            description: `Transfer to ${recipient.name} (${recipient.email})`,
            paymentMethod: 'WALLET_TRANSFER',
            recipientId: recipient.id,
            status: 'COMPLETED',
            balanceBefore: senderBalanceBefore,
            balanceAfter: senderBalanceAfter,
          },
        })

        // Create recipient's transaction record
        await tx.transaction.create({
          data: {
            userId: recipient.id,
            type: 'TRANSFER_IN',
            amount: amountNum,
            description: `Transfer from ${session.user.name} (${session.user.email})`,
            paymentMethod: 'WALLET_TRANSFER',
            status: 'COMPLETED',
            balanceBefore: recipientBalanceBefore,
            balanceAfter: recipientBalanceAfter,
          },
        })
      } else {
        // Transfer to external e-wallet (Vodafone Cash, e& Cash, Orange Cash)
        // Update sender's wallet
        await tx.wallet.update({
          where: { userId: session.user.id },
          data: { balance: senderBalanceAfter },
        })

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: session.user.id,
            type: 'TRANSFER_OUT',
            amount: -amountNum,
            description: `Transfer to ${destination.replace(
              '_',
              ' '
            )} (${recipientIdentifier})`,
            paymentMethod: destination as any,
            status: 'COMPLETED',
            balanceBefore: senderBalanceBefore,
            balanceAfter: senderBalanceAfter,
          },
        })
      }
    })

    revalidatePath('/d/dashboard')
    revalidatePath('/p/dashboard')
    const lng = await getLocaleFromCookies()
    const { t } = await getTranslation(lng, 'actions')
    return {
      success: true,
      message: t('success.transferSuccess', { amount: amountNum.toFixed(2) }),
    }
  } catch (error) {
    console.error('Transfer money error:', error)
    throw error
  }
}
