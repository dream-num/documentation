import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { DocsHeader } from '@/components/docs-shell/header'
import { Footer } from '@/components/footer'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guides } from '@/lib/source'
import { createToolsNavigation } from '@/lib/tools/navigation'

export async function ToolsShell({
  children,
  lang,
  pathname,
}: {
  children: ReactNode
  lang: string
  pathname: string
}) {
  const t = await getTranslations({ locale: lang as Locale })
  const navigation = createToolsNavigation(pathname, {
    themeCustomizer: t('tools.theme-customizer'),
  })
  const guideNavigation = createGuideNavigation(guides.pageTree[lang], pathname)

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <DocsHeader
        guideItems={guideNavigation.items}
        items={navigation.items}
        lang={lang}
        pathname={pathname}
        searchScope="all"
        title={t('tools.section')}
      />
      <main className="mx-auto w-full max-w-384 px-4 py-8 lg:px-12 lg:pb-12">
        {children}
        <Footer variant="content" />
      </main>
    </div>
  )
}
