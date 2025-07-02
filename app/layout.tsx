import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider'
import { locales, translations } from '@/lib/i18n'
import { Body } from './layout.client'
import './global.css'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  return (
    <html lang={lang} suppressHydrationWarning>
      <Body className="flex min-h-screen flex-col antialiased">
        <RootProvider
          i18n={{
            locale: lang,
            locales,
            translations: translations[lang],
          }}
        >
          {children}
        </RootProvider>
      </Body>
    </html>
  )
}
