'use client'
import { useState, useTransition, useMemo } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

export default function Signin() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const lng = (pathname?.split('/')[1] || 'en') as Locale
  const { t } = useTranslation(lng, 'auth')
  
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Zod schema for login validation with translated messages
  const signinSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({
          message: t('signin.validation.validEmail'),
        }),
        password: z.string().min(6, {
          message: t('signin.validation.minPassword'),
        }),
      }),
    [t]
  )

  type SigninFormValues = z.infer<typeof signinSchema>

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: SigninFormValues) {
    setMessage(null)
    startTransition(async () => {
      try {
        const response = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })
        console.log('Respons: ', response)
        if (response?.error) {
          setMessage({
            type: 'error',
            text: response.code || t('signin.invalidCredentials'),
          })
        } else if (response?.ok) {
          setMessage({
            type: 'success',
            text: t('signin.loginSuccess'),
          })
          form.reset()

          // Redirect based on user role
          setTimeout(() => {
            if (session?.user?.role === Role.DRIVER) {
              router.push(`/${lng}/d/dashboard`)
            } else if (session?.user?.role === Role.PASSENGER) {
              router.push(`/${lng}/p/dashboard`)
            } else {
              router.push(`/${lng}`)
            }
            router.refresh()
          }, 500)
        }
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error?.message || t('signin.loginError'),
        })
      }
    })
  }

  return (
    <section className='bg-muted h-screen'>
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center gap-6 lg:justify-start'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='min-w-88 border-muted bg-background flex w-full flex-col items-center gap-y-4 rounded-md border px-6 py-8 shadow-md'
            >
              <h2 className='text-xl md:text-2xl font-bold text-center mb-2'>
                {t('signin.title')}
              </h2>

              {message && (
                <div
                  className={`w-full rounded-md p-3 text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>{t('signin.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder={t('signin.emailPlaceholder')}
                        className='placeholder:text-sm placeholder:md:text-xs'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>{t('signin.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={t('signin.passwordPlaceholder')}
                        className='placeholder:text-sm placeholder:md:text-xs'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={isPending}>
                {isPending ? t('signin.signingIn') : t('signin.signInButton')}
              </Button>

              <div className='text-sm text-center text-muted-foreground'>
                {t('signin.dontHaveAccount')}{' '}
                <Link
                  href={`/${lng}/auth/signup`}
                  className='text-primary hover:underline font-medium'
                >
                  {t('signin.signUp')}
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}
