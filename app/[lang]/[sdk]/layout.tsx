import type { ReactNode } from 'react'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { GuidesLayout } from '@/components/guides/layout'
import { routing } from '@/i18n/routing'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guideNavigationSource } from '@/lib/guides/navigation-source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const navigation = createGuideNavigation(guideNavigationSource.pageTree[lang], '')

  return (
    <GuidesLayout items={navigation.items} lang={lang}>
      {children}
    </GuidesLayout>
  )
}
