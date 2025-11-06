'use client'

import React from 'react'
import Link from 'next/link'
import { User, Wallet, Car, Route as RouteIcon } from 'lucide-react'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface DriverNavigationProps {
  hasVehicle: boolean
  hasRoute: boolean
  lng: Locale
}

const getNavigationItems = (hasVehicle: boolean, hasRoute: boolean, t: any, lng: Locale) => [
  {
    icon: User,
    label: t('driverDashboard.navigation.profile.label'),
    description: t('driverDashboard.navigation.profile.description'),
    href: `/${lng}/d/dashboard/profile`,
    color: 'blue',
    borderLight: 'border-blue-100',
    borderHover: 'hover:border-blue-300',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    arrowColor: 'text-blue-500',
    show: true,
  },
  {
    icon: Car,
    label: hasVehicle ? t('driverDashboard.navigation.vehicle.labelUpdate') : t('driverDashboard.navigation.vehicle.labelRegister'),
    description: hasVehicle ? t('driverDashboard.navigation.vehicle.descriptionUpdate') : t('driverDashboard.navigation.vehicle.descriptionRegister'),
    href: `/${lng}/d/dashboard/vehicles/registration`,
    color: 'purple',
    borderLight: 'border-purple-100',
    borderHover: 'hover:border-purple-300',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    arrowColor: 'text-purple-500',
    show: true,
  },
  {
    icon: RouteIcon,
    label: hasRoute ? t('driverDashboard.navigation.route.labelUpdate') : t('driverDashboard.navigation.route.labelRegister'),
    description: hasRoute ? t('driverDashboard.navigation.route.descriptionUpdate') : t('driverDashboard.navigation.route.descriptionRegister'),
    href: `/${lng}/d/dashboard/routes/registration`,
    color: 'orange',
    borderLight: 'border-orange-100',
    borderHover: 'hover:border-orange-300',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    arrowColor: 'text-orange-500',
    show: true,
    disabled: !hasVehicle,
  },
  {
    icon: Wallet,
    label: t('driverDashboard.navigation.wallet.label'),
    description: t('driverDashboard.navigation.wallet.description'),
    href: `/${lng}/d/dashboard/wallet`,
    color: 'green',
    borderLight: 'border-green-100',
    borderHover: 'hover:border-green-300',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    arrowColor: 'text-green-500',
    show: true,
  },
]

export function DriverNavigation({
  hasVehicle,
  hasRoute,
  lng,
}: DriverNavigationProps) {
  const { t } = useTranslation(lng, 'dashboard')
  const items = getNavigationItems(hasVehicle, hasRoute, t, lng).filter(
    (item) => item.show
  )

  return (
    <div className='max-w-md mx-auto mb-4'>
      <h2 className='text-sm font-semibold text-gray-700 mb-2 px-1'>
        {t('driverDashboard.quickAccess')}
      </h2>
      <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
        {items.map((item) => {
          const Icon = item.icon
          const content = (
            <div
              className={`bg-white rounded-xl shadow-md p-3 border ${item.borderLight} ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : `${item.borderHover} active:scale-95`
              } transition-all duration-200 w-28 flex-shrink-0`}
            >
              <div className='flex flex-col items-center text-center'>
                {/* Icon */}
                <div className={`${item.iconBg} rounded-lg p-2 mb-2`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>

                {/* Label */}
                <h3 className='text-xs font-bold text-gray-800 leading-tight'>
                  {item.label}
                </h3>
                <p className='text-xs text-gray-500 mt-0.5'>{item.description}</p>
                
                {/* Lock indicator for disabled items */}
                {item.disabled && (
                  <p className='text-[10px] text-gray-400 mt-1'>
                    {t('driverDashboard.navigation.needVehicle')}
                  </p>
                )}
              </div>
            </div>
          )

          if (item.disabled) {
            return (
              <div key={item.href} className='flex-shrink-0'>
                {content}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href} className='flex-shrink-0'>
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

