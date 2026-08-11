import { LanguagesIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { DocsNavItem } from '@/lib/docs/navigation'
import type { GuideNavItem } from '@/lib/guides/navigation'
import { GithubInfo } from '@/components/github-info/github-info'
import { Logo } from '@/components/logo'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { messagesByLocale } from '@/messages'

import { GuidesSearch } from '../guides/search'
import { DocsMobileNav } from './mobile-nav'
import { PrimaryNavigation } from './primary-navigation'
import { SidebarVersionSwitcher } from './sidebar-version-switcher'

function LanguageSwitcher({
  lang,
  currentPath,
  currentLabel,
  label,
}: {
  lang: string
  currentPath: string
  currentLabel: string
  label: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button aria-label={label} size="icon" type="button" variant="outline" />}>
        <LanguagesIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            render={<Link className="justify-between" href={currentPath} locale={locale} />}
          >
            <span>{messagesByLocale[locale].common['display-name'] ?? locale}</span>
            {locale === lang ? <span className="text-muted-foreground text-xs">{currentLabel}</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export async function DocsHeader({
  lang,
  guideItems,
  items,
  pathname,
  title,
  searchScope,
}: {
  lang: string
  guideItems: GuideNavItem[]
  items: DocsNavItem[]
  pathname: string
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

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm lg:shrink-0">
      <div className="mx-auto flex h-16 max-w-384 items-center gap-3 px-4 lg:px-6">
        <DocsMobileNav
          navigationLabel={t('docs.sidebar-navigation', { title })}
          openLabel={t('docs.open-navigation', { title })}
          headerExtra={searchScope === 'reference' ? <SidebarVersionSwitcher /> : null}
          items={items}
          pathname={pathname}
          title={title}
        />
        <Link aria-label={t('navigation.univer-home')} className="flex shrink-0 items-center" href="/">
          <Logo />
        </Link>
        <PrimaryNavigation items={guideItems} labels={navigationLabels} pathname={pathname} />
        <div className="min-w-0 flex-1" />
        <div className="md:hidden">
          <GuidesSearch compact lang={lang} defaultScope={searchScope} />
        </div>
        <div className="hidden md:block">
          <GuidesSearch lang={lang} defaultScope={searchScope} />
        </div>
        <LanguageSwitcher
          currentLabel={t('navigation.current-locale')}
          currentPath={pathname}
          label={t('common.choose-language')}
          lang={lang}
        />
        <ThemeSwitcher label={t('common.choose-theme')} />
        <GithubInfo className="hidden xl:flex" owner="dream-num" repo="univer" />
      </div>
    </header>
  )
}
