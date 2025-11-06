'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface ReloadButtonProps {
  lng: Locale
}

export function ReloadButton({ lng }: ReloadButtonProps) {
  const router = useRouter()
  const { t } = useTranslation(lng, 'dashboard')

  const handleReload = () => {
    router.refresh()
  }

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={handleReload}
      className='flex items-center gap-2'
    >
      <RefreshCw className='w-4 h-4' />
      {t('activeRide.reload')}
    </Button>
  )
}
