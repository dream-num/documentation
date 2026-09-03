import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { PrimaryNavigation } from '@/components/docs-shell/primary-navigation'
import { GithubInfo } from '@/components/github-info/github-info'
import { GuidesSearch } from '@/components/guides/search'
import { Logo } from '@/components/logo'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { messagesByLocale } from '@/messages'

import type { ISiteDocumentationLink, ISiteNavLink } from './mobile-menu'
import { SiteLanguageSwitcher } from './language-switcher'
import { SiteMobileMenu } from './mobile-menu'
import { OfficeSdkBanner } from './office-sdk-banner'

export async function SiteHeader({
  guideItems,
  lang,
  links,
  documentationLinks,
  documentationTitle,
}: {
  guideItems: IGuideNavItem[]
  lang: string
  links: ISiteNavLink[]
  documentationLinks: ISiteDocumentationLink[]
  documentationTitle: string
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
    displayName: messagesByLocale[locale].common['display-name'],
    locale,
  }))

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-384 items-center gap-2 px-4 lg:px-6">
        <SiteMobileMenu
          documentationLinks={documentationLinks}
          documentationTitle={documentationTitle}
          links={links}
          navigationLabel={t('navigation.site-navigation')}
          openLabel={t('navigation.open-site-navigation')}
        />
        <Link aria-label={t('navigation.univer-home')} className="flex shrink-0 items-center" href="/">
          <Logo className="h-8 w-auto" />
        </Link>
        <PrimaryNavigation items={guideItems} labels={navigationLabels} />
        <div className="min-w-0 flex-1" />
        <div className="md:hidden">
          <GuidesSearch compact lang={lang} defaultScope="all" />
        </div>
        <div className="hidden md:block">
          <GuidesSearch lang={lang} defaultScope="all" />
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
      <OfficeSdkBanner />
    </header>
  )
}
