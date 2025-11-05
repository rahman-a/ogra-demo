'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  isUpdateMode?: boolean
}

export function SubmitButton({ isUpdateMode = false }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type='submit'
      disabled={pending}
      className='w-full h-14 text-lg font-semibold bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg disabled:opacity-50'
    >
      {pending ? (
        <>
          <Loader2 className='w-5 h-5 mr-2 animate-spin' />
          {isUpdateMode ? 'Updating Route...' : 'Registering Route...'}
        </>
      ) : isUpdateMode ? (
        'Update Route'
      ) : (
        'Register Route'
      )}
    </Button>
  )
}
