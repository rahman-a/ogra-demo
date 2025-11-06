import type { Metadata } from 'next'
import { getTranslation } from '@/i18n'
import type { Locale } from '@/i18n/settings'

type Props = {
  params: Promise<{ lng: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'landing')

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
    },
  }
}

export default async function Home({ params }: Props) {
  const { lng } = (await params) as { lng: Locale }
  const { t } = await getTranslation(lng, 'landing')
  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-gray-50'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white'>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className='relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8'>
          <div className='grid gap-12 lg:grid-cols-2 lg:gap-8 items-center'>
            <div className='flex flex-col gap-8'>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm w-fit'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'></span>
                </span>
                {t('hero.liveNow')}
              </div>
              <h1 className='text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl'>
                {t('hero.title')}
              </h1>
              <p className='text-xl text-blue-100 leading-relaxed'>
                {t('hero.description')}
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <a
                  href='#download'
                  className='inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl hover:bg-blue-50 transition-all transform hover:scale-105'
                >
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
                    />
                  </svg>
                  {t('hero.downloadApp')}
                </a>
                <a
                  href='#how-it-works'
                  className='inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all'
                >
                  {t('hero.seeHowItWorks')}
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </a>
              </div>
              <div className='flex gap-8 pt-4'>
                <div>
                  <div className='text-3xl font-bold'>50K+</div>
                  <div className='text-blue-200'>
                    {t('hero.stats.activeRides')}
                  </div>
                </div>
                <div>
                  <div className='text-3xl font-bold'>4.8★</div>
                  <div className='text-blue-200'>
                    {t('hero.stats.userRating')}
                  </div>
                </div>
                <div>
                  <div className='text-3xl font-bold'>100K+</div>
                  <div className='text-blue-200'>
                    {t('hero.stats.happyUsers')}
                  </div>
                </div>
              </div>
            </div>
            <div className='relative lg:h-[600px]'>
              <div className='absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl'></div>
              <div className='relative bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl'>
                <div className='bg-white rounded-2xl p-6 shadow-xl'>
                  <div className='flex items-center gap-3 mb-6 pb-4 border-b'>
                    <div className='h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold'>
                      A
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        {t('hero.demo.title')}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {t('hero.demo.route')}
                      </div>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='text-sm font-medium text-gray-700 mb-3'>
                      {t('hero.demo.liveSeatView')}
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      {[1, 2, 3, 4, 5, 6].map((seat) => (
                        <div
                          key={seat}
                          className={`rounded-lg border-2 p-4 text-center font-semibold transition-all ${
                            seat === 2 || seat === 5
                              ? 'bg-green-500 border-green-600 text-white animate-pulse'
                              : 'bg-gray-100 border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className='text-xs mb-1'>
                            {t('hero.demo.seat')}
                          </div>
                          <div className='text-lg'>{seat}</div>
                          {(seat === 2 || seat === 5) && (
                            <div className='text-xs mt-1'>
                              {t('hero.demo.booked')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id='how-it-works' className='py-24 bg-white'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              {t('howItWorks.title')}
            </h2>
            <p className='mt-4 text-xl text-gray-600'>
              {t('howItWorks.subtitle')}
            </p>
          </div>

          {/* Driver Flow */}
          <div className='mb-20'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='rounded-full bg-blue-600 p-3'>
                <svg
                  className='h-8 w-8 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='text-3xl font-bold text-gray-900'>
                {t('howItWorks.forDrivers')}
              </h3>
            </div>
            <div className='grid gap-8 md:grid-cols-3'>
              <div className='relative rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-lg'>
                <div className='absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold'>
                  1
                </div>
                <div className='mb-4 inline-flex rounded-lg bg-blue-600 p-3'>
                  <svg
                    className='h-6 w-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <h4 className='text-xl font-semibold text-gray-900 mb-3'>
                  {t('howItWorks.driver.step1.title')}
                </h4>
                <p className='text-gray-600'>
                  {t('howItWorks.driver.step1.description')}
                </p>
              </div>
              <div className='relative rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-lg'>
                <div className='absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold'>
                  2
                </div>
                <div className='mb-4 inline-flex rounded-lg bg-blue-600 p-3'>
                  <svg
                    className='h-6 w-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                </div>
                <h4 className='text-xl font-semibold text-gray-900 mb-3'>
                  {t('howItWorks.driver.step2.title')}
                </h4>
                <p className='text-gray-600'>
                  {t('howItWorks.driver.step2.description')}
                </p>
              </div>
              <div className='relative rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-lg'>
                <div className='absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold'>
                  3
                </div>
                <div className='mb-4 inline-flex rounded-lg bg-blue-600 p-3'>
                  <svg
                    className='h-6 w-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                    />
                  </svg>
                </div>
                <h4 className='text-xl font-semibold text-gray-900 mb-3'>
                  {t('howItWorks.driver.step3.title')}
                </h4>
                <p className='text-gray-600'>
                  {t('howItWorks.driver.step3.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Flow */}
          <div>
            <div className='flex items-center gap-3 mb-8'>
              <div className='rounded-full bg-indigo-600 p-3'>
                <svg
                  className='h-8 w-8 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
              </div>
              <h3 className='text-3xl font-bold text-gray-900'>
                {t('howItWorks.forPassengers')}
              </h3>
            </div>
            <div className='grid gap-8 md:grid-cols-3'>
              <div className='relative rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-lg'>
                <div className='absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold'>
                  1
                </div>
                <div className='mb-4 inline-flex rounded-lg bg-indigo-600 p-3'>
                  <svg
                    className='h-6 w-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z'
                    />
                  </svg>
                </div>
                <h4 className='text-xl font-semibold text-gray-900 mb-3'>
                  {t('howItWorks.passenger.step1.title')}
                </h4>
                <p className='text-gray-600'>
                  {t('howItWorks.passenger.step1.description')}
                </p>
              </div>
              <div className='relative rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-lg'>
                <div className='absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold'>
                  2
                </div>
                <div className='mb-4 inline-flex rounded-lg bg-indigo-600 p-3'>
                  <svg
                    className='h-6 w-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 20l4-16m2 16l4-16M6 9h14M4 15h14'
                    />
                  </svg>
                </div>
                <h4 className='text-xl font-semibold text-gray-900 mb-3'>
                  {t('howItWorks.passenger.step2.title')}
                </h4>
                <p className='text-gray-600'>
                  {t('howItWorks.passenger.step2.description')}
                </p>
              </div>
              <div className='relative rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-lg'>
                <div className='absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold'>
                  3
                </div>
                <div className='mb-4 inline-flex rounded-lg bg-indigo-600 p-3'>
                  <svg
                    className='h-6 w-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2'
                    />
                  </svg>
                </div>
                <h4 className='text-xl font-semibold text-gray-900 mb-3'>
                  {t('howItWorks.passenger.step3.title')}
                </h4>
                <p className='text-gray-600'>
                  {t('howItWorks.passenger.step3.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className='py-24 bg-gradient-to-b from-gray-50 to-white'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              {t('features.title')}
            </h2>
            <p className='mt-4 text-xl text-gray-600'>
              {t('features.subtitle')}
            </p>
          </div>
          <div className='grid gap-8 lg:grid-cols-2'>
            <div className='relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200'>
              <div className='flex items-start gap-4'>
                <div className='rounded-2xl bg-blue-600 p-4'>
                  <svg
                    className='h-8 w-8 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                </div>
                <div className='flex-1'>
                  <h3 className='text-2xl font-semibold text-gray-900 mb-3'>
                    {t('features.realTime.title')}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {t('features.realTime.description')}
                  </p>
                </div>
              </div>
            </div>
            <div className='relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200'>
              <div className='flex items-start gap-4'>
                <div className='rounded-2xl bg-indigo-600 p-4'>
                  <svg
                    className='h-8 w-8 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <div className='flex-1'>
                  <h3 className='text-2xl font-semibold text-gray-900 mb-3'>
                    {t('features.notifications.title')}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {t('features.notifications.description')}
                  </p>
                </div>
              </div>
            </div>
            <div className='relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200'>
              <div className='flex items-start gap-4'>
                <div className='rounded-2xl bg-green-600 p-4'>
                  <svg
                    className='h-8 w-8 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z'
                    />
                  </svg>
                </div>
                <div className='flex-1'>
                  <h3 className='text-2xl font-semibold text-gray-900 mb-3'>
                    {t('features.multipleBooking.title')}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {t('features.multipleBooking.description')}
                  </p>
                </div>
              </div>
            </div>
            <div className='relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200'>
              <div className='flex items-start gap-4'>
                <div className='rounded-2xl bg-purple-600 p-4'>
                  <svg
                    className='h-8 w-8 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
                <div className='flex-1'>
                  <h3 className='text-2xl font-semibold text-gray-900 mb-3'>
                    {t('features.securePayments.title')}
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    {t('features.securePayments.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-24 bg-white'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='grid gap-12 lg:grid-cols-2 items-center'>
            <div>
              <h2 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6'>
                {t('benefits.title')}
              </h2>
              <div className='space-y-6'>
                <div className='flex gap-4'>
                  <div className='flex-shrink-0'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                      <svg
                        className='h-6 w-6 text-blue-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      {t('benefits.convenience.title')}
                    </h3>
                    <p className='text-gray-600'>
                      {t('benefits.convenience.description')}
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex-shrink-0'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                      <svg
                        className='h-6 w-6 text-green-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      {t('benefits.transparency.title')}
                    </h3>
                    <p className='text-gray-600'>
                      {t('benefits.transparency.description')}
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex-shrink-0'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-purple-100'>
                      <svg
                        className='h-6 w-6 text-purple-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 10V3L4 14h7v7l9-11h-7z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      {t('benefits.technology.title')}
                    </h3>
                    <p className='text-gray-600'>
                      {t('benefits.technology.description')}
                    </p>
                  </div>
                </div>
                <div className='flex gap-4'>
                  <div className='flex-shrink-0'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-100'>
                      <svg
                        className='h-6 w-6 text-orange-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      {t('benefits.earnMore.title')}
                    </h3>
                    <p className='text-gray-600'>
                      {t('benefits.earnMore.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl transform rotate-3'></div>
              <div className='relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl'>
                    <div>
                      <div className='text-sm text-gray-600 mb-1'>
                        {t('benefits.stats.earnings')}
                      </div>
                      <div className='text-3xl font-bold text-gray-900'>
                        {t('benefits.stats.earningsValue')}
                      </div>
                    </div>
                    <div className='text-4xl'>💰</div>
                  </div>
                  <div className='flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl'>
                    <div>
                      <div className='text-sm text-gray-600 mb-1'>
                        {t('benefits.stats.savings')}
                      </div>
                      <div className='text-3xl font-bold text-gray-900'>
                        {t('benefits.stats.savingsValue')}
                      </div>
                    </div>
                    <div className='text-4xl'>📉</div>
                  </div>
                  <div className='flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl'>
                    <div>
                      <div className='text-sm text-gray-600 mb-1'>
                        {t('benefits.stats.speed')}
                      </div>
                      <div className='text-3xl font-bold text-gray-900'>
                        {t('benefits.stats.speedValue')}
                      </div>
                    </div>
                    <div className='text-4xl'>⚡</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-24 bg-gradient-to-b from-gray-50 to-white'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              {t('testimonials.title')}
            </h2>
            <p className='mt-4 text-xl text-gray-600'>
              {t('testimonials.subtitle')}
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-3'>
            <div className='rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200'>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className='h-5 w-5 text-yellow-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                ))}
              </div>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                &ldquo;{t('testimonials.testimonial1.quote')}&rdquo;
              </p>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold'>
                  M
                </div>
                <div>
                  <div className='font-semibold text-gray-900'>
                    {t('testimonials.testimonial1.name')}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {t('testimonials.testimonial1.role')}
                  </div>
                </div>
              </div>
            </div>
            <div className='rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200'>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className='h-5 w-5 text-yellow-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                ))}
              </div>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                &ldquo;{t('testimonials.testimonial2.quote')}&rdquo;
              </p>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold'>
                  S
                </div>
                <div>
                  <div className='font-semibold text-gray-900'>
                    {t('testimonials.testimonial2.name')}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {t('testimonials.testimonial2.role')}
                  </div>
                </div>
              </div>
            </div>
            <div className='rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200'>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className='h-5 w-5 text-yellow-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                ))}
              </div>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                &ldquo;{t('testimonials.testimonial3.quote')}&rdquo;
              </p>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold'>
                  K
                </div>
                <div>
                  <div className='font-semibold text-gray-900'>
                    {t('testimonials.testimonial3.name')}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {t('testimonials.testimonial3.role')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className='mt-16 grid gap-8 md:grid-cols-4'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                <svg
                  className='h-8 w-8 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <h3 className='font-semibold text-gray-900'>
                {t('testimonials.trust.securePayments')}
              </h3>
              <p className='mt-2 text-sm text-gray-600'>
                {t('testimonials.trust.securePaymentsDesc')}
              </p>
            </div>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                <svg
                  className='h-8 w-8 text-green-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                  />
                </svg>
              </div>
              <h3 className='font-semibold text-gray-900'>
                {t('testimonials.trust.verifiedDrivers')}
              </h3>
              <p className='mt-2 text-sm text-gray-600'>
                {t('testimonials.trust.verifiedDriversDesc')}
              </p>
            </div>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100'>
                <svg
                  className='h-8 w-8 text-purple-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
              </div>
              <h3 className='font-semibold text-gray-900'>
                {t('testimonials.trust.support247')}
              </h3>
              <p className='mt-2 text-sm text-gray-600'>
                {t('testimonials.trust.support247Desc')}
              </p>
            </div>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100'>
                <svg
                  className='h-8 w-8 text-orange-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='font-semibold text-gray-900'>
                {t('testimonials.trust.insuranceCovered')}
              </h3>
              <p className='mt-2 text-sm text-gray-600'>
                {t('testimonials.trust.insuranceCoveredDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id='download'
        className='py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white'
      >
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='text-center'>
            <h2 className='text-4xl font-bold tracking-tight sm:text-5xl mb-6'>
              {t('cta.title')}
            </h2>
            <p className='mx-auto max-w-2xl text-xl text-blue-100 mb-12'>
              {t('cta.subtitle')}
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
              <a
                href='#'
                className='inline-flex items-center justify-center gap-3 rounded-2xl bg-black px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-gray-900 transition-all transform hover:scale-105'
              >
                <svg
                  className='h-8 w-8'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' />
                </svg>
                <div className='text-left'>
                  <div className='text-xs'>{t('cta.downloadOn')}</div>
                  <div className='text-lg font-bold'>{t('cta.appStore')}</div>
                </div>
              </a>
              <a
                href='#'
                className='inline-flex items-center justify-center gap-3 rounded-2xl bg-black px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-gray-900 transition-all transform hover:scale-105'
              >
                <svg
                  className='h-8 w-8'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626c.547.315.547 1.109 0 1.424l-2.807 1.626-2.302-2.302 2.302-2.374zM3.609 2.734L14.546 9.067 5.911 17.702 3.61 2.734z' />
                </svg>
                <div className='text-left'>
                  <div className='text-xs'>{t('cta.getItOn')}</div>
                  <div className='text-lg font-bold'>{t('cta.googlePlay')}</div>
                </div>
              </a>
            </div>
            <div className='flex items-center justify-center gap-8 text-blue-100'>
              <div className='flex items-center gap-2'>
                <svg
                  className='h-5 w-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
                <span>4.8 {t('cta.rating')}</span>
              </div>
              <div>•</div>
              <div>100K+ {t('cta.downloads')}</div>
              <div>•</div>
              <div>{t('cta.freeToUse')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-gray-300'>
        <div className='mx-auto max-w-7xl px-6 py-12 lg:px-8'>
          <div className='grid gap-8 md:grid-cols-4'>
            <div className='md:col-span-2'>
              <div className='text-2xl font-bold text-white mb-4'>
                {t('footer.brandName')}
              </div>
              <p className='text-gray-400 mb-6 max-w-md'>
                {t('footer.description')}
              </p>
              <div className='flex gap-4'>
                <a
                  href='#'
                  className='rounded-full bg-gray-800 p-2 hover:bg-gray-700 transition-colors'
                  aria-label='Facebook'
                >
                  <svg
                    className='h-6 w-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                </a>
                <a
                  href='#'
                  className='rounded-full bg-gray-800 p-2 hover:bg-gray-700 transition-colors'
                  aria-label='Twitter'
                >
                  <svg
                    className='h-6 w-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                  </svg>
                </a>
                <a
                  href='#'
                  className='rounded-full bg-gray-800 p-2 hover:bg-gray-700 transition-colors'
                  aria-label='Instagram'
                >
                  <svg
                    className='h-6 w-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z' />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className='text-white font-semibold mb-4'>
                {t('footer.product')}
              </h3>
              <ul className='space-y-2'>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.features')}
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.pricing')}
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.faq')}
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.support')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='text-white font-semibold mb-4'>
                {t('footer.company')}
              </h3>
              <ul className='space-y-2'>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.aboutUs')}
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.careers')}
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.privacy')}
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition-colors'>
                    {t('footer.terms')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='mt-12 border-t border-gray-800 pt-8 text-center text-gray-400'>
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
