'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface SubmitButtonProps {
  isUpdateMode?: boolean
  lng: Locale
}

export function SubmitButton({ isUpdateMode = false, lng }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const { t } = useTranslation(lng, 'dashboard')

  return (
    <Button
      type='submit'
      disabled={pending}
      className='w-full h-14 text-lg font-semibold bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg disabled:opacity-50'
    >
      {pending ? (
        <>
          <Loader2 className='w-5 h-5 mr-2 animate-spin' />
          {isUpdateMode
            ? t('vehicleRegistration.updating')
            : t('vehicleRegistration.registering')}
        </>
      ) : isUpdateMode ? (
        t('vehicleRegistration.updateVehicle')
      ) : (
        t('vehicleRegistration.registerVehicle')
      )}
    </Button>
  )
}
