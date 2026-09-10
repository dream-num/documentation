import { SiGithub } from '@icons-pack/react-simple-icons'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { PrimaryNavigation } from '@/components/docs-shell/primary-navigation'
import { Logo } from '@/components/logo'
import { SiteLanguageSwitcher } from '@/components/site/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { messagesByLocale } from '@/messages'

import { GuidesMobileNav } from './mobile-nav'
import { GuidesSearch } from './search'

export async function GuidesHeader({ lang, items }: { lang: string; items: IGuideNavItem[] }) {
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
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b border-(--separator) backdrop-blur-sm lg:shrink-0">
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
        <Link
          aria-label={t('navigation.univer-home')}
          className="flex shrink-0 items-center border-r border-(--separator) pr-2.5 sm:pr-4"
          href="/"
        >
          <Logo className="h-8 w-auto" />
        </Link>
        <PrimaryNavigation items={items} labels={navigationLabels} />
        <div className="min-w-0 flex-1" />
        <div className="flex items-center gap-1">
          <div className="hidden sm:block">
            <GuidesSearch lang={lang} />
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
      <PrimaryNavigation items={items} labels={navigationLabels} mobile />
      <div className="border-t border-(--separator) px-4 py-1.5 sm:hidden">
        <GuidesSearch lang={lang} />
      </div>
    </header>
  )
}
