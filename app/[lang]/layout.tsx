import type { ReactNode } from 'react'
import { defineI18nUI } from 'fumadocs-ui/i18n'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { i18nConfig, translations } from '@/lib/i18n'
import { Wrapper } from './layout.client'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  const { provider } = defineI18nUI(i18nConfig, translations)

  return (
    <RootProvider i18n={provider(lang)}>
      <Wrapper>
        {children}
      </Wrapper>
    </RootProvider>
  )
}
