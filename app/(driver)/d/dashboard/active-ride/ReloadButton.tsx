'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function ReloadButton() {
  const router = useRouter()

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
      Reload
    </Button>
  )
}
