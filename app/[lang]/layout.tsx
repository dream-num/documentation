import type { ReactNode } from 'react'
import { Banner } from 'fumadocs-ui/components/banner'
import { RootProvider } from 'fumadocs-ui/provider'
import { Inter } from 'next/font/google'
import { locales, translations } from '@/lib/i18n'
import './global.css'

const inter = Inter({
  subsets: ['latin'],
})

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const lang = (await params).lang

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          i18n={{
            locale: lang,
            locales,
            translations: translations[lang],
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
