import type { ReactNode } from 'react'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { routing } from '@/i18n/routing'

import { Wrapper } from './layout.client'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }

  setRequestLocale(lang)

  return (
    <NextIntlClientProvider>
      <ThemeProvider>
        <Wrapper>{children}</Wrapper>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }))
}
