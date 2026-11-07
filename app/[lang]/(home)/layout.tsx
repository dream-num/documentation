import type { ReactNode } from 'react'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { routing } from '@/i18n/routing'
import { clsx } from '@/lib/clsx'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guideNavigationSource } from '@/lib/guides/navigation-source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  const t = await getTranslations({ locale: lang })
  const guideNavigation = createGuideNavigation(guideNavigationSource.pageTree[lang], '')
  const links = [
    {
      text: t('navigation.reference'),
      url: '/reference',
    },
    {
      text: t('navigation.blog'),
      url: '/blog',
    },
    {
      text: t('navigation.showcase'),
      url: 'https://office.univer.ai',
    },
  ]

  return (
    <div className={clsx('min-h-screen', 'bg-background', 'text-foreground')}>
      <SiteHeader guideItems={guideNavigation.items} lang={lang} links={links} />
      {children}
    </div>
  )
}
