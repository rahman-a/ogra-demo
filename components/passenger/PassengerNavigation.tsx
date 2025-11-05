'use client'

import React from 'react'
import Link from 'next/link'
import { User, Wallet, History, Settings } from 'lucide-react'

const navigationItems = [
  {
    icon: User,
    label: 'Profile',
    description: 'Manage your info',
    href: '/p/dashboard/profile',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-100',
    borderHover: 'hover:border-blue-300',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    arrowColor: 'text-blue-500',
  },
  {
    icon: Wallet,
    label: 'Wallet',
    description: 'Manage funds',
    href: '/p/dashboard/wallet',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50',
    borderLight: 'border-green-100',
    borderHover: 'hover:border-green-300',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    arrowColor: 'text-green-500',
  },
]

export function PassengerNavigation() {
  return (
    <div className='max-w-md mx-auto mb-4'>
      <h2 className='text-sm font-semibold text-gray-700 mb-2 px-1'>
        Quick Access
      </h2>
      <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className='flex-shrink-0'>
              <div
                className={`bg-white rounded-xl shadow-md p-3 border ${item.borderLight} ${item.borderHover} active:scale-95 transition-all duration-200 w-32`}
              >
                <div className='flex flex-col items-center text-center'>
                  {/* Icon */}
                  <div className={`${item.iconBg} rounded-lg p-2 mb-2`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  
                  {/* Label */}
                  <h3 className='text-sm font-bold text-gray-800'>
                    {item.label}
                  </h3>
                  <p className='text-xs text-gray-500 mt-0.5'>{item.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

