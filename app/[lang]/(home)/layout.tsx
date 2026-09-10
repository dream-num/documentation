import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { SiteHeader } from '@/components/site/header'
import { clsx } from '@/lib/clsx'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guideNavigationSource } from '@/lib/guides/navigation-source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })
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
      url: '/showcase',
    },
  ]

  return (
    <div className={clsx('min-h-screen', 'bg-background', 'text-foreground')}>
      <SiteHeader guideItems={guideNavigation.items} lang={lang} links={links} />
      {children}
    </div>
  )
}
