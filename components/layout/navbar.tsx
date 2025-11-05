import React from 'react'
import { Menu } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { auth as getSession } from '@/auth'
import { headers } from 'next/headers'
import { cn } from '@/lib/utils'
import { ROLES_ROUTES } from '@/lib/constants'
import { LogoutButton } from './logout-button'

const excludedRoutes = ['/auth/signin', '/auth/signup']

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: MenuItem[]
}

interface Navbar1Props {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  menu?: MenuItem[]
  auth?: {
    login: {
      title: string
      url: string
    }
    signup: {
      title: string
      url: string
    }
  }
}

export default async function Navbar({
  menu = [],
  auth = {
    login: { title: 'Login', url: '/auth/signin' },
    signup: { title: 'Sign up', url: '/auth/signup' },
  },
}: Navbar1Props) {
  const headerList = await headers()
  const pathname = headerList.get('x-current-path')
  const session = await getSession()
  const isExcluded = excludedRoutes.includes(pathname!)

  // Build dynamic menu based on user role
  const dynamicMenu = [...menu]

  if (session?.user) {
    // Add role-specific items for drivers
    if (session.user.role === 'DRIVER') {
      dynamicMenu.push(
        {
          title: 'Vehicle',
          url: '/d/dashboard/vehicles/registration',
        },
        {
          title: 'Route',
          url: '/d/dashboard/routes/registration',
        }
      )
    }

    // Add profile for all authenticated users
    const profileUrl =
      session.user.role === 'DRIVER'
        ? '/d/dashboard/profile'
        : '/p/dashboard/profile'

    dynamicMenu.push({
      title: 'Profile',
      url: profileUrl,
    })
  }

  return (
    <section
      className={cn('p-4', {
        hidden: isExcluded,
      })}
    >
      <div className='container'>
        {/* Desktop Menu */}
        <nav className='hidden justify-between lg:flex'>
          <div className='flex items-center gap-6'>
            {/* Logo */}
            <a href='#' className='flex items-center gap-2' />
            <div className='flex items-center'>
              <NavigationMenu>
                <NavigationMenuList>
                  {dynamicMenu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className='flex gap-2'>
            {session?.user ? (
              <>
                <Button asChild variant='outline' size='sm'>
                  <a
                    href={
                      ROLES_ROUTES[
                        session?.user.role as keyof typeof ROLES_ROUTES
                      ]
                    }
                  >
                    Dashboard
                  </a>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button asChild variant='outline' size='sm'>
                  <a href={auth.login.url}>{auth.login.title}</a>
                </Button>
                <Button asChild size='sm'>
                  <a href={auth.signup.url}>{auth.signup.title}</a>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className='block lg:hidden'>
          <div className='flex items-center justify-between'>
            {/* Logo */}
            <a href='#' className='flex items-center gap-2' />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline' size='icon'>
                  <Menu className='size-4' />
                </Button>
              </SheetTrigger>
              <SheetContent className='overflow-y-auto'>
                <SheetHeader>
                  <SheetTitle>
                    <a href='#' className='flex items-center gap-2' />
                  </SheetTitle>
                </SheetHeader>
                <div className='flex flex-col gap-6 p-4'>
                  <Accordion
                    type='single'
                    collapsible
                    className='flex w-full flex-col gap-4'
                  >
                    {dynamicMenu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className='flex flex-col gap-3'>
                    {session?.user ? (
                      <>
                        <Button asChild variant='outline' size='sm'>
                          <a
                            href={
                              ROLES_ROUTES[
                                session?.user.role as keyof typeof ROLES_ROUTES
                              ]
                            }
                          >
                            Dashboard
                          </a>
                        </Button>
                        <LogoutButton />
                      </>
                    ) : (
                      <>
                        <Button asChild variant='outline' size='sm'>
                          <a href={auth.login.url}>{auth.login.title}</a>
                        </Button>
                        <Button asChild size='sm'>
                          <a href={auth.signup.url}>{auth.signup.title}</a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  )
}

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className='bg-popover text-popover-foreground'>
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className='w-80'>
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className='bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors'
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className='border-b-0'>
        <AccordionTrigger className='text-md py-0 font-semibold hover:no-underline'>
          {item.title}
        </AccordionTrigger>
        <AccordionContent className='mt-2'>
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <a key={item.title} href={item.url} className='text-md font-semibold'>
      {item.title}
    </a>
  )
}

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className='hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors'
      href={item.url}
    >
      <div className='text-foreground'>{item.icon}</div>
      <div>
        <div className='text-sm font-semibold'>{item.title}</div>
        {item.description && (
          <p className='text-muted-foreground text-sm leading-snug'>
            {item.description}
          </p>
        )}
      </div>
    </a>
  )
}
