'use client'

import React from 'react'
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

type Transaction = {
  id: string
  type: string
  amount: number
  description: string | null
  status: string
  createdAt: Date
  balanceAfter: number
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  lng: Locale
}

export function TransactionHistory({
  transactions,
  lng,
}: TransactionHistoryProps) {
  const { t } = useTranslation(lng, 'dashboard')
  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowUpCircle className='w-5 h-5 text-green-600' />
    } else {
      return <ArrowDownCircle className='w-5 h-5 text-red-600' />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className='w-4 h-4 text-green-600' />
      case 'PENDING':
        return <Clock className='w-4 h-4 text-yellow-600' />
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className='w-4 h-4 text-red-600' />
      default:
        return null
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return t('passengerWallet.walletCharge')
      case 'WITHDRAWAL':
        return t('passengerWallet.withdrawal')
      case 'BOOKING_PAYMENT':
        return t('passengerWallet.bookingPayment')
      case 'BOOKING_REFUND':
        return t('passengerWallet.bookingRefund')
      case 'RIDE_EARNING':
        return t('passengerWallet.rideEarning')
      case 'TRANSFER_IN':
        return t('passengerWallet.transferReceived')
      case 'TRANSFER_OUT':
        return t('passengerWallet.transferSent')
      default:
        return type
    }
  }

  if (transactions.length === 0) {
    return (
      <div className='bg-white rounded-2xl shadow-lg p-8 text-center'>
        <Clock className='w-16 h-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-700 mb-2'>
          {t('passengerWallet.noTransactionsYet')}
        </h3>
        <p className='text-sm text-gray-500'>
          {t('passengerWallet.transactionHistoryAppear')}
        </p>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg p-6'>
      <h2 className='text-xl font-bold text-gray-800 mb-4'>
        {t('passengerWallet.transactionHistory')}
      </h2>

      <div className='space-y-3'>
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <div className='flex items-center gap-3 flex-1'>
              <div className='bg-white p-2 rounded-full'>
                {getTransactionIcon(transaction.type, transaction.amount)}
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <p className='font-semibold text-gray-800'>
                    {getTransactionLabel(transaction.type)}
                  </p>
                  {getStatusIcon(transaction.status)}
                </div>
                {transaction.description && (
                  <p className='text-xs text-gray-600 mt-1'>
                    {transaction.description}
                  </p>
                )}
                <p className='text-xs text-gray-500 mt-1'>
                  {new Date(transaction.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

                <div className='text-right'>
                  <p
                    className={`text-lg font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {lng === 'ar'
                      ? `${transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)} ${t('currency.symbol')}`
                      : `${transaction.amount > 0 ? '+' : ''}${t('currency.symbol')}${Math.abs(transaction.amount).toFixed(2)}`}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {t('passengerWallet.balance')}:{' '}
                    {lng === 'ar'
                      ? `${transaction.balanceAfter.toFixed(2)} ${t('currency.symbol')}`
                      : `${t('currency.symbol')}${transaction.balanceAfter.toFixed(2)}`}
                  </p>
                </div>
          </div>
        ))}
      </div>
    </div>
  )
}
