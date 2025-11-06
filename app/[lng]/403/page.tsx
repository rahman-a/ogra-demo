import React from 'react'
import { LockKeyhole } from 'lucide-react'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export default async function NotAllowed({ params }: Props) {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'common')

  return (
    <div className='flex flex-col gap-5 items-center justify-center min-h-screen'>
      <LockKeyhole size={50} />
      <div className='flex flex-col items-center gap-5'>
        <h1 className='font-bold text-4xl'>{t('403.title')}</h1>
        <p className='text-lg'>{t('403.description')}</p>
      </div>
    </div>
  )
}
