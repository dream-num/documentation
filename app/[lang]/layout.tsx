import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { routing } from '@/i18n/routing'
import { Wrapper } from './layout.client'
import '../global.css'

export const metadata: Metadata = {
  title: {
    default: 'Univer Office SDK',
    template: '%s | Univer Office SDK',
  },
}

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }

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
        <NextIntlClientProvider>
          <ThemeProvider>
            <Wrapper>{children}</Wrapper>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }))
}
