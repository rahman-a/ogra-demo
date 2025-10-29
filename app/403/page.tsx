import React from 'react'
import { LockKeyhole } from 'lucide-react'
type Props = object

export default function NotAllowed({}: Props) {
  return (
    <div className='flex flex-col gap-5 items-center justify-center min-h-screen'>
      <LockKeyhole size={50} />
      <div className='flex flex-col items-center gap-5'>
        <h1 className='font-bold text-4xl'>
          Access to this page is restricted
        </h1>
        <p className='text-lg'>
          Please check with the site admin if you believe this is a mistake.
        </p>
      </div>
    </div>
  )
}
