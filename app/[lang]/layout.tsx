import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider'
import { locales, translations } from '@/lib/i18n'
import { Wrapper } from './layout.client'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  return (
    <RootProvider
      i18n={{
        locale: lang,
        locales,
        translations: translations[lang],
      }}
    >
      <Wrapper>
        {children}
      </Wrapper>
    </RootProvider>
  )
}
