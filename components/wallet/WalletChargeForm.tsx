'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, Plus, Loader2 } from 'lucide-react'
import { addFundsToWallet } from '@/actions/WalletActions'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

const quickAmounts = [50, 100, 200, 500, 1000]

interface WalletChargeFormProps {
  lng: Locale
}

export function WalletChargeForm({ lng }: WalletChargeFormProps) {
  const { t } = useTranslation(lng, 'dashboard')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(t('passengerWallet.invalidAmount'), {
        description: t('passengerWallet.enterValidAmount'),
        duration: 5000,
      })
      return
    }

    setLoading(true)
    const loadingToast = toast.loading(t('passengerWallet.processingPayment'))

    try {
      const result = await addFundsToWallet(amountNum)

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success(t('passengerWallet.success'), {
          description: result.message,
          duration: 5000,
        })
        setAmount('')
        // Refresh the page to show updated balance
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast.error(t('passengerWallet.failed'), {
          description: result.message,
          duration: 5000,
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(t('passengerWallet.error'), {
        description: t('passengerWallet.failedToProcess'),
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg p-6'>
      <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
        <Plus className='w-6 h-6 text-green-600' />
        {t('passengerWallet.chargeWallet')}
      </h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Quick Amount Buttons */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t('passengerWallet.quickSelect')}
          </label>
          <div className='grid grid-cols-3 sm:grid-cols-5 gap-2'>
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                type='button'
                variant='outline'
                onClick={() => handleQuickAmount(quickAmount)}
                disabled={loading}
                className={`h-12 ${
                  amount === quickAmount.toString()
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : ''
                }`}
              >
                {lng === 'ar'
                  ? `${quickAmount} ${t('currency.symbol')}`
                  : `${t('currency.symbol')}${quickAmount}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <label
            htmlFor='amount'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            {t('passengerWallet.orEnterCustomAmount')}
          </label>
          <div className='relative'>
            <span
              className={`absolute top-1/2 -translate-y-1/2 text-gray-500 font-medium ${
                lng === 'ar' ? 'right-4' : 'left-4'
              }`}
            >
              {t('currency.symbol')}
            </span>
            <input
              id='amount'
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              placeholder='0.00'
              step='0.01'
              min='0'
              max='10000'
              className={`w-full py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                lng === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'
              }`}
            />
          </div>
          <p className='text-xs text-gray-500 mt-1'>
            {t('passengerWallet.maximumAmount')}
          </p>
        </div>

        {/* Test Mode Notice */}
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
          <p className='text-xs text-yellow-800'>
            {t('passengerWallet.testModeNotice')}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type='submit'
          disabled={!amount || loading}
          className='w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold'
        >
          {loading ? (
            <>
              <Loader2 className='w-5 h-5 mr-2 animate-spin' />
              {t('passengerWallet.processing')}
            </>
          ) : (
            <>
              <Wallet className='w-5 h-5 mr-2' />
              {t('passengerWallet.addToWallet', {
                amount:
                  lng === 'ar'
                    ? `${amount || '0'} ${t('currency.symbol')}`
                    : `${t('currency.symbol')}${amount || '0'}`,
              })}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

