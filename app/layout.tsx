import type { ReactNode } from 'react'
import { hasLocale } from 'next-intl'
import { cookies } from 'next/headers'
import NextTopLoader from 'nextjs-toploader'

import { routing } from '@/i18n/routing'

import './global.css'

interface IProps {
  children: ReactNode
}

export default async function Layout({ children }: IProps) {
  const cookieStore = await cookies()
  const requestedLocale = cookieStore.get('FD_LOCALE')?.value
  const lang = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <NextTopLoader
          color="#171717"
          showSpinner={false}
          crawlSpeed={180}
          easing="ease-in-out"
          speed={350}
          shadow="0 0 10px #171717,0 0 5px #171717"
          zIndex={99999}
        />
        {children}
      </body>
    </html>
  )
}
