import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getWalletData } from '@/actions/WalletActions'
import Link from 'next/link'
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WalletChargeForm } from '@/components/wallet/WalletChargeForm'
import { TransactionHistory } from '@/components/wallet/TransactionHistory'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function PassengerWalletPage({ params }: Props) {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'dashboard')
  const session = await auth()

  if (!session || !session.user) {
    redirect(`/${lng}/auth/signin`)
  }

  const walletData = await getWalletData()

  if (!walletData) {
    redirect(`/${lng}/auth/signin`)
  }

  // Calculate statistics
  const totalDeposits = walletData.transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSpent = walletData.transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className='min-h-screen bg-linear-to-b from-green-50 to-white pb-20'>
      {/* Header */}
      <div className='bg-white shadow-sm sticky top-0 z-30'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <Link href={`/${lng}/p/dashboard`}>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6 ltr:block rtl:hidden' />
              <ArrowRight className='w-6 h-6 ltr:hidden rtl:block' />
            </Button>
          </Link>
          <h1 className='text-lg font-bold text-gray-800'>
            {t('passengerWallet.title')}
          </h1>
          <div className='w-10' /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6 space-y-6'>
        {/* Balance Card */}
        <div className='bg-linear-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white'>
          <div className='flex items-center gap-2 mb-2'>
            <Wallet className='w-6 h-6' />
            <span className='text-sm opacity-90'>
              {t('passengerWallet.currentBalance')}
            </span>
          </div>
          <div className='text-4xl font-bold mb-4'>
            {lng === 'ar'
              ? `${walletData.balance.toFixed(2)} ${t('currency.symbol')}`
              : `${t('currency.symbol')}${walletData.balance.toFixed(2)}`}
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-2 gap-4 pt-4 border-t border-white/20'>
            <div>
              <div className='flex items-center gap-1 mb-1'>
                <TrendingUp className='w-4 h-4' />
                <span className='text-xs opacity-75'>
                  {t('passengerWallet.totalDeposits')}
                </span>
              </div>
              <p className='text-lg font-semibold'>
                {lng === 'ar'
                  ? `${totalDeposits.toFixed(2)} ${t('currency.symbol')}`
                  : `${t('currency.symbol')}${totalDeposits.toFixed(2)}`}
              </p>
            </div>
            <div>
              <div className='flex items-center gap-1 mb-1'>
                <TrendingDown className='w-4 h-4' />
                <span className='text-xs opacity-75'>
                  {t('passengerWallet.totalSpent')}
                </span>
              </div>
              <p className='text-lg font-semibold'>
                {lng === 'ar'
                  ? `${totalSpent.toFixed(2)} ${t('currency.symbol')}`
                  : `${t('currency.symbol')}${totalSpent.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Charge Wallet Form */}
        <WalletChargeForm lng={lng} />

        {/* Transaction History */}
        <TransactionHistory transactions={walletData.transactions} lng={lng} />
      </div>
    </div>
  )
}
