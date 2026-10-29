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
    overview: t('navigation.overview'),
    primary: t('navigation.primary-navigation'),
    showcase: t('navigation.showcase'),
    tools: t('navigation.tools'),
  }
  const locales = routing.locales.map((locale) => ({
    displayName: messagesByLocale[locale].common['display-name'],
    locale,
  }))

  return (
    <header className="sticky top-0 z-40 border-b border-(--separator) bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80 lg:shrink-0">
      <div className="mx-auto flex h-12 max-w-384 items-center gap-2 px-4 lg:px-6">
        <GuidesMobileNav
          labels={{
            guides: t('search.scope.guides'),
            products: t('navigation.products'),
          }}
          navigationLabel={t('docs.guides-navigation')}
          openLabel={t('docs.open-guides-navigation')}
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
          <GuidesSearch lang={lang} />
          <a
            href="https://github.com/dream-num/univer"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:inline-flex"
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
    </header>
  )
}
