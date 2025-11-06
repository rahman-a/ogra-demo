import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getWalletData } from '@/actions/WalletActions'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionHistory } from '@/components/wallet/TransactionHistory'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function DriverWalletPage({ params }: Props) {
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

  // Calculate driver-specific statistics
  const totalEarnings = walletData.transactions
    .filter((t) => t.type === 'RIDE_EARNING')
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingEarnings = walletData.transactions
    .filter((t) => t.type === 'RIDE_EARNING' && t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0)

  const completedRides = walletData.transactions.filter(
    (t) => t.type === 'RIDE_EARNING' && t.status === 'COMPLETED'
  ).length

  return (
    <div className='min-h-screen bg-linear-to-b from-blue-50 to-white pb-20'>
      {/* Header */}
      <div className='bg-white shadow-sm sticky top-0 z-30'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <Link href={`/${lng}/d/dashboard`}>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <ArrowLeft className='w-6 h-6 ltr:block rtl:hidden' />
              <ArrowRight className='w-6 h-6 ltr:hidden rtl:block' />
            </Button>
          </Link>
          <h1 className='text-lg font-bold text-gray-800'>
            {t('driverWallet.title')}
          </h1>
          <div className='w-10' /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6 space-y-6'>
        {/* Balance Card */}
        <div className='bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white'>
          <div className='flex items-center gap-2 mb-2'>
            <Wallet className='w-6 h-6' />
            <span className='text-sm opacity-90'>
              {t('driverWallet.totalBalance')}
            </span>
          </div>
          <div className='text-4xl font-bold mb-4'>
            {lng === 'ar'
              ? `${walletData.balance.toFixed(2)} ${t('currency.symbol')}`
              : `${t('currency.symbol')}${walletData.balance.toFixed(2)}`}
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-3 gap-4 pt-4 border-t border-white/20'>
            <div>
              <div className='flex items-center gap-1 mb-1'>
                <TrendingUp className='w-4 h-4' />
                <span className='text-xs opacity-75'>
                  {t('driverWallet.totalEarnings')}
                </span>
              </div>
              <p className='text-lg font-semibold'>
                {lng === 'ar'
                  ? `${totalEarnings.toFixed(2)} ${t('currency.symbol')}`
                  : `${t('currency.symbol')}${totalEarnings.toFixed(2)}`}
              </p>
            </div>
            <div>
              <div className='flex items-center gap-1 mb-1'>
                <DollarSign className='w-4 h-4' />
                <span className='text-xs opacity-75'>
                  {t('driverWallet.pending')}
                </span>
              </div>
              <p className='text-lg font-semibold'>
                {lng === 'ar'
                  ? `${pendingEarnings.toFixed(2)} ${t('currency.symbol')}`
                  : `${t('currency.symbol')}${pendingEarnings.toFixed(2)}`}
              </p>
            </div>
            <div>
              <div className='flex items-center gap-1 mb-1'>
                <TrendingUp className='w-4 h-4' />
                <span className='text-xs opacity-75'>
                  {t('driverWallet.completedRides')}
                </span>
              </div>
              <p className='text-lg font-semibold'>{completedRides}</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className='bg-blue-50 border-2 border-blue-200 rounded-2xl p-4'>
          <h3 className='font-bold text-blue-800 mb-2'>
            {t('driverWallet.howItWorks')}
          </h3>
          <ul className='text-sm text-blue-700 space-y-1'>
            <li>{t('driverWallet.earnFromRides')}</li>
            <li>{t('driverWallet.cashDirect')}</li>
            <li>{t('driverWallet.withdrawAnytime')}</li>
            <li>{t('driverWallet.trackTransactions')}</li>
          </ul>
        </div>

        {/* Transaction History */}
        <TransactionHistory transactions={walletData.transactions} lng={lng} />
      </div>
    </div>
  )
}
