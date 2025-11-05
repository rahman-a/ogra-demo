'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wallet, Plus, Loader2 } from 'lucide-react'
import { addFundsToWallet } from '@/actions/WalletActions'
import { toast } from 'sonner'

const quickAmounts = [50, 100, 200, 500, 1000]

export function WalletChargeForm() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountNum = parseFloat(amount)

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid amount greater than 0',
        duration: 5000,
      })
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Processing payment...')

    try {
      const result = await addFundsToWallet(amountNum)

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success('Success!', {
          description: result.message,
          duration: 5000,
        })
        setAmount('')
        // Refresh the page to show updated balance
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast.error('Failed', {
          description: result.message,
          duration: 5000,
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error('Error', {
        description: 'Failed to process payment',
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
        Charge Wallet
      </h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Quick Amount Buttons */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Quick Select
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
                E£{quickAmount}
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
            Or Enter Custom Amount
          </label>
          <div className='relative'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium'>
              E£
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
              className='w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>
          <p className='text-xs text-gray-500 mt-1'>
            Maximum amount: E£10,000
          </p>
        </div>

        {/* Test Mode Notice */}
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
          <p className='text-xs text-yellow-800'>
            ⚠️ <span className='font-bold'>TEST MODE:</span> This is a test
            feature. Funds are added instantly without actual payment
            processing.
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
              Processing...
            </>
          ) : (
            <>
              <Wallet className='w-5 h-5 mr-2' />
              Add E£{amount || '0'} to Wallet
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

