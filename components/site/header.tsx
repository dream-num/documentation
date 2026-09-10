import { SiGithub } from '@icons-pack/react-simple-icons'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { PrimaryNavigation } from '@/components/docs-shell/primary-navigation'
import { GuidesSearch } from '@/components/guides/search'
import { Logo } from '@/components/logo'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { messagesByLocale } from '@/messages'

import type { ISiteNavLink } from './mobile-menu'
import { SiteLanguageSwitcher } from './language-switcher'
import { SiteMobileMenu } from './mobile-menu'

export async function SiteHeader({
  guideItems,
  lang,
  links,
}: {
  guideItems: IGuideNavItem[]
  lang: string
  links: ISiteNavLink[]
}) {
  const t = await getTranslations({ locale: lang as Locale })
  const navigationLabels = {
    blog: t('navigation.blog'),
    primary: t('navigation.primary-navigation'),
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
          links={links}
          navigationLabel={t('navigation.site-navigation')}
          openLabel={t('navigation.open-site-navigation')}
        />
        <Link
          aria-label={t('navigation.univer-home')}
          className="flex shrink-0 items-center border-r pr-2.5 sm:pr-4"
          href="/"
        >
          <Logo className="h-8 w-auto" />
        </Link>
        <PrimaryNavigation items={guideItems} labels={navigationLabels} />
        <div className="min-w-0 flex-1" />
        <div className="flex items-center gap-1">
          <div className="md:hidden">
            <GuidesSearch compact lang={lang} defaultScope="all" />
          </div>
          <div className="hidden md:block">
            <GuidesSearch lang={lang} defaultScope="all" />
          </div>
          <a
            href="https://github.com/dream-num/univer"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-primary hidden size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:inline-flex"
          >
            <SiGithub aria-hidden="true" className="size-4" />
          </a>
          <SiteLanguageSwitcher
            currentLabel={t('navigation.current-locale')}
            label={t('common.choose-language')}
            lang={lang}
            locales={locales}
          />
          <ThemeSwitcher label={t('common.choose-theme')} />
        </div>
      </div>
      <PrimaryNavigation items={guideItems} labels={navigationLabels} mobile />
    </header>
  )
}
