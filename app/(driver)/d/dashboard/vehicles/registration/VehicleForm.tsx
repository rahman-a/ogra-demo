'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={pending}
      className='w-full h-14 text-lg font-semibold bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg disabled:opacity-50'
    >
      {pending ? (
        <>
          <Loader2 className='w-5 h-5 mr-2 animate-spin' />
          Registering...
        </>
      ) : (
        'Register Vehicle'
      )}
    </Button>
  )
}
