import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { IDocsNavItem } from '@/lib/docs/navigation'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { GithubInfo } from '@/components/github-info/github-info'
import { Logo } from '@/components/logo'
import { SiteLanguageSwitcher } from '@/components/site/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { messagesByLocale } from '@/messages'

import { GuidesSearch } from '../guides/search'
import { DocsMobileNav } from './mobile-nav'
import { PrimaryNavigation } from './primary-navigation'
import { SidebarVersionSwitcher } from './sidebar-version-switcher'

export async function DocsHeader({
  lang,
  guideItems,
  items,
  title,
  searchScope,
}: {
  lang: string
  guideItems: IGuideNavItem[]
  items: IDocsNavItem[]
  title: string
  searchScope: 'reference' | 'icons' | 'all'
}) {
  const t = await getTranslations({ locale: lang as Locale })
  const navigationLabels = {
    blog: t('navigation.blog'),
    primary: t('navigation.primary-navigation'),
    products: t('navigation.products'),
    reference: t('navigation.reference'),
    showcase: t('navigation.showcase'),
    tools: t('navigation.tools'),
  }
  const locales = routing.locales.map((locale) => ({
    displayName: messagesByLocale[locale].common['display-name'] ?? locale,
    locale,
  }))

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm lg:shrink-0">
      <div className="mx-auto flex h-12 max-w-384 items-center gap-2 px-4 lg:px-6">
        <DocsMobileNav
          navigationLabel={t('docs.sidebar-navigation', { title })}
          openLabel={t('docs.open-navigation', { title })}
          headerExtra={searchScope === 'reference' ? <SidebarVersionSwitcher /> : null}
          items={items}
          title={title}
        />
        <Link aria-label={t('navigation.univer-home')} className="flex shrink-0 items-center" href="/">
          <Logo className="h-8 w-auto" />
        </Link>
        <PrimaryNavigation items={guideItems} labels={navigationLabels} />
        <div className="min-w-0 flex-1" />
        <div className="md:hidden">
          <GuidesSearch compact lang={lang} defaultScope={searchScope} />
        </div>
        <div className="hidden md:block">
          <GuidesSearch lang={lang} defaultScope={searchScope} />
        </div>
        <SiteLanguageSwitcher
          currentLabel={t('navigation.current-locale')}
          label={t('common.choose-language')}
          lang={lang}
          locales={locales}
        />
        <ThemeSwitcher label={t('common.choose-theme')} />
        <GithubInfo className="hidden xl:flex" owner="dream-num" repo="univer" />
      </div>
    </header>
  )
}
