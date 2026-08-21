import type { TOCItemType } from 'fumadocs-core/toc'
import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { IGuideNavigation } from '@/lib/guides/navigation'
import { RootScrollLock } from '@/components/docs-shell/root-scroll-lock'
import { Footer } from '@/components/footer'

import { GuidesHeader } from './header'
import { GuidesSidebar } from './sidebar'
import { GuidesToc } from './toc'

export async function GuidesLayout({
  lang,
  navigation,
  pathname,
  toc,
  children,
  tocFooter,
}: {
  lang: string
  navigation: IGuideNavigation
  pathname: string
  toc?: TOCItemType[]
  children: ReactNode
  tocFooter?: ReactNode
}) {
  const t = await getTranslations({ locale: lang as Locale })

  return (
    <div
      className="bg-background text-foreground min-h-dvh lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden"
      data-docs-shell
    >
      <RootScrollLock />
      <GuidesHeader items={navigation.items} lang={lang} pathname={pathname} />
      <div className="mx-auto grid w-full max-w-384 grid-cols-1 gap-8 px-4 py-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-4 lg:overflow-hidden lg:px-6 lg:pt-8 lg:pb-0 xl:grid-cols-[18rem_minmax(0,1fr)_17rem]">
        <aside
          aria-label={t('docs.guides-sidebar')}
          className="hidden lg:block lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-4 lg:pb-8"
        >
          <GuidesSidebar
            items={navigation.items}
            label={t('docs.guides-navigation')}
            labels={{
              guides: t('search.scope.guides'),
              products: t('navigation.products'),
            }}
            pathname={pathname}
          />
        </aside>
        <main
          className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-6 lg:pb-8"
          data-doc-scroll-container
        >
          {children}
          <Footer variant="content" />
        </main>
        <aside
          aria-label={t('docs.toc-panel')}
          className="hidden xl:block xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:pb-8 xl:pl-4"
        >
          <GuidesToc items={toc} lang={lang} />
          {tocFooter ? <div className="mt-6">{tocFooter}</div> : null}
        </aside>
      </div>
    </div>
  )
}
