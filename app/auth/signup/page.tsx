'use client'
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
import { registerUser } from '@/actions/Registration'
import { useState, useTransition } from 'react'
import { Role } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Zod schema for form validation
const signupSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Password must be at least 6 characters.',
    }),
    role: z.enum([Role.DRIVER, Role.PASSENGER]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function Signup() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: Role.PASSENGER,
    },
  })

  async function onSubmit(data: SignupFormValues) {
    setMessage(null)
    startTransition(async () => {
      const result = await registerUser(null, {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      console.log('Result: ', result)
      if (result?.response === 'success') {
        setMessage({
          type: 'success',
          text:
            result.message ||
            'Account created successfully! Redirecting to login...',
        })
        form.reset()

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else if (result?.response === 'error') {
        setMessage({
          type: 'error',
          text: result.message || 'An error occurred during registration.',
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
              className='min-w-80 md:min-w-sm border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-4 rounded-md border px-4 md:px-6 py-8 shadow-md'
            >
              <h2 className='text-xl md:text-2xl font-bold text-center mb-2'>
                Sign Up
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
                name='name'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
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

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Confirm your password'
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
                name='role'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>I am a</FormLabel>
                    <FormControl>
                      <div className='flex gap-4'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            value={Role.PASSENGER}
                            checked={field.value === Role.PASSENGER}
                            onChange={field.onChange}
                            className='w-4 h-4'
                          />
                          <span className='text-sm md:text-base'>
                            Passenger
                          </span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            value={Role.DRIVER}
                            checked={field.value === Role.DRIVER}
                            onChange={field.onChange}
                            className='w-4 h-4'
                          />
                          <span className='text-sm md:text-base'>Driver</span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={isPending}>
                {isPending ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className='text-sm text-center text-muted-foreground'>
                Already have an account?{' '}
                <Link
                  href='/auth/signin'
                  className='text-primary hover:underline font-medium'
                >
                  Sign in
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}
