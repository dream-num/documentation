import type { SiteDocumentationLink, SiteNavLink } from './mobile-menu'
import type { Locale } from '@/i18n/routing'
import type { GuideNavItem } from '@/lib/guides/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { PrimaryNavigation } from '@/components/docs-shell/primary-navigation'
import { GithubInfo } from '@/components/github-info/github-info'
import { GuidesSearch } from '@/components/guides/search'
import { Logo } from '@/components/logo'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { routing } from '@/i18n/routing'
import { messagesByLocale } from '@/messages'
import { SiteLanguageSwitcher } from './language-switcher'
import { SiteMobileMenu } from './mobile-menu'

export async function SiteHeader({
  guideItems,
  lang,
  links,
  documentationLinks,
  documentationTitle,
  pathname = '',
}: {
  guideItems: GuideNavItem[]
  lang: string
  links: SiteNavLink[]
  documentationLinks: SiteDocumentationLink[]
  documentationTitle: string
  pathname?: string
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
  const locales = routing.locales.map(locale => ({
    displayName: messagesByLocale[locale].common['display-name'],
    locale,
  }))

  return (
    <header
      className="
        sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm
        supports-backdrop-filter:bg-background/80
      "
    >
      <div
        className="
          mx-auto flex h-16 max-w-384 items-center gap-3 px-4
          lg:px-6
        "
      >
        <SiteMobileMenu
          documentationLinks={documentationLinks}
          documentationTitle={documentationTitle}
          links={links}
          navigationLabel={t('navigation.site-navigation')}
          openLabel={t('navigation.open-site-navigation')}
        />
        <Link aria-label={t('navigation.univer-home')} className="flex shrink-0 items-center" href="/">
          <Logo />
        </Link>
        <PrimaryNavigation items={guideItems} labels={navigationLabels} lang={lang} pathname={pathname} />
        <div className="min-w-0 flex-1" />
        <div className="md:hidden">
          <GuidesSearch compact lang={lang} defaultScope="all" />
        </div>
        <div
          className="
            hidden
            md:block
          "
        >
          <GuidesSearch lang={lang} defaultScope="all" />
        </div>
        <SiteLanguageSwitcher
          currentLabel={t('navigation.current-locale')}
          label={t('common.choose-language')}
          lang={lang}
          locales={locales}
        />
        <ThemeSwitcher label={t('common.choose-theme')} />
        <GithubInfo
          className="
            hidden
            xl:flex
          "
          owner="dream-num"
          repo="univer"
        />
      </div>
    </header>
  )
}
