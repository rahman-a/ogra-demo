'use client'
import { useState, useTransition } from 'react'
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
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Role } from '@prisma/client'

// Zod schema for login validation
const signinSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
})

type SigninFormValues = z.infer<typeof signinSchema>

export default function Signin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

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
            text: response.code || 'Invalid email or password.',
          })
        } else if (response?.ok) {
          setMessage({
            type: 'success',
            text: 'Login successful! Redirecting...',
          })
          form.reset()

          // Redirect based on user role
          setTimeout(() => {
            if (session?.user?.role === Role.DRIVER) {
              router.push('/d/dashboard')
            } else if (session?.user?.role === Role.PASSENGER) {
              router.push('/p/dashboard')
            } else {
              router.push('/')
            }
            router.refresh()
          }, 500)
        }
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error?.message || 'An error occurred during login.',
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
                Sign In
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john@example.com'
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Enter your password'
                        className='placeholder:text-sm placeholder:md:text-xs'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={isPending}>
                {isPending ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className='text-sm text-center text-muted-foreground'>
                Don&apos;t have an account?{' '}
                <Link
                  href='/auth/signup'
                  className='text-primary hover:underline font-medium'
                >
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}
