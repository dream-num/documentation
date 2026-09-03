import type { TOCItemType } from 'fumadocs-core/toc'
import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { DocsNavigation } from '@/lib/docs/navigation'
import { Footer } from '@/components/footer'
import { GuidesSidebarControls } from '@/components/guides/sidebar-controls'
import { clsx } from '@/lib/clsx'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guides } from '@/lib/source'

import { DocsHeader } from './header'
import { RootScrollLock } from './root-scroll-lock'
import { DocsSidebar } from './sidebar'
import { SidebarVersionSwitcher } from './sidebar-version-switcher'
import { DocsToc } from './toc'

export async function DocsShellLayout({
  lang,
  navigation,
  pathname,
  title,
  toc,
  children,
  tocFooter,
  searchScope,
}: {
  lang: string
  navigation: DocsNavigation
  pathname: string
  title: string
  toc?: TOCItemType[]
  children: ReactNode
  tocFooter?: ReactNode
  searchScope: 'reference' | 'icons' | 'all'
}) {
  const t = await getTranslations({ locale: lang as Locale })
  const guideNavigation = createGuideNavigation(guides.pageTree[lang], pathname)

  return (
    <div
      className={clsx(
        'min-h-dvh',
        'bg-background text-foreground',
        'lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden',
      )}
      data-docs-shell
    >
      <RootScrollLock />
      <DocsHeader
        guideItems={guideNavigation.items}
        items={navigation.items}
        lang={lang}
        pathname={pathname}
        searchScope={searchScope}
        title={title}
      />
      <div className="mx-auto grid w-full max-w-384 grid-cols-1 gap-8 px-4 py-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-4 lg:overflow-hidden lg:px-6 lg:pt-0 lg:pb-0 xl:grid-cols-[18rem_minmax(0,1fr)_17rem]">
        <aside
          aria-label={t('docs.sidebar', { title })}
          className="hidden lg:block lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pt-8 lg:pr-4 lg:pb-8"
        >
          {searchScope === 'reference' ? (
            <div className="mb-4">
              <SidebarVersionSwitcher />
            </div>
          ) : null}
          {searchScope === 'icons' ? (
            <GuidesSidebarControls
              includeIcons
              items={guideNavigation.items}
              labels={{
                guides: t('search.scope.guides'),
                products: t('navigation.products'),
              }}
              pathname={pathname}
              showVersion={false}
            />
          ) : null}
          <DocsSidebar items={navigation.items} label={t('docs.sidebar-navigation', { title })} pathname={pathname} />
        </aside>
        <main
          className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-6 lg:pt-8 lg:pb-8"
          data-doc-scroll-container
        >
          {children}
          <Footer variant="content" />
        </main>
        <aside
          aria-label={t('docs.toc-panel')}
          className="hidden xl:block xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:pt-8 xl:pb-8 xl:pl-4"
        >
          <DocsToc items={toc} lang={lang} />
          {tocFooter ? <div className="mt-6">{tocFooter}</div> : null}
        </aside>
      </div>
    </div>
  )
}
