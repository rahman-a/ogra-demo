'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { logout } from '@/actions/Logout'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface LogoutButtonProps {
  lng: Locale
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
}

export function LogoutButton({
  lng,
  variant = 'outline',
  size = 'sm',
  showIcon = false,
}: LogoutButtonProps) {
  const { t } = useTranslation(lng, 'common')
  
  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button onClick={handleLogout} variant={variant} size={size}>
      {showIcon && <LogOut className='mr-2 size-4' />}
      {t('logout')}
    </Button>
  )
}
