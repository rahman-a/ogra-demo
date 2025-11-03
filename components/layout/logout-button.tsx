'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { logout } from '@/actions/Logout'

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
}

export function LogoutButton({
  variant = 'outline',
  size = 'sm',
  showIcon = false,
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button onClick={handleLogout} variant={variant} size={size}>
      {showIcon && <LogOut className='mr-2 size-4' />}
      Logout
    </Button>
  )
}
