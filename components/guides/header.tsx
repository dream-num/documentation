import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { PrimaryNavigation } from '@/components/docs-shell/primary-navigation'
import { GithubInfo } from '@/components/github-info/github-info'
import { Logo } from '@/components/logo'
import { SiteLanguageSwitcher } from '@/components/site/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { messagesByLocale } from '@/messages'

import { OfficeSdkBanner } from '../site/office-sdk-banner'
import { GuidesMobileNav } from './mobile-nav'
import { GuidesSearch } from './search'

export async function GuidesHeader({ lang, items }: { lang: string; items: IGuideNavItem[] }) {
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
    displayName: messagesByLocale[locale].common['display-name'],
    locale,
  }))

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm lg:shrink-0">
      <div className="mx-auto flex h-12 max-w-384 items-center gap-2 px-4 lg:px-6">
        <GuidesMobileNav
          labels={{
            guides: t('search.scope.guides'),
            products: t('navigation.products'),
          }}
          navigationLabel={t('docs.guides-navigation')}
          openLabel={t('docs.open-guides-navigation')}
          title={t('search.scope.guides')}
          items={items}
        />
        <Link aria-label={t('navigation.univer-home')} className="flex shrink-0 items-center" href="/">
          <Logo className="h-8 w-auto" />
        </Link>
        <PrimaryNavigation items={items} labels={navigationLabels} />
        <div className="min-w-0 flex-1" />
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <GuidesSearch lang={lang} />
          </div>
          <SiteLanguageSwitcher
            currentLabel={t('navigation.current-locale')}
            label={t('common.choose-language')}
            lang={lang}
            locales={locales}
          />
          <ThemeSwitcher label={t('common.choose-theme')} />
          <div className="hidden xl:block">
            <GithubInfo owner="dream-num" repo="univer" />
          </div>
        </div>
      </div>
      <div className="border-t px-4 py-1.5 sm:hidden">
        <GuidesSearch lang={lang} />
      </div>
      <OfficeSdkBanner />
    </header>
  )
}
