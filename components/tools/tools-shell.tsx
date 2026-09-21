import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { DocsHeader } from '@/components/docs-shell/header'
import { Footer } from '@/components/footer'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guideNavigationSource } from '@/lib/guides/navigation-source'
import { withLocale } from '@/lib/locale-path'
import { createToolsNavigation } from '@/lib/tools/navigation'

import { ToolsWorkspace } from './tools-workspace'

export async function ToolsShell({ children, lang }: { children: ReactNode; lang: string }) {
  const t = await getTranslations({ locale: lang as Locale })
  const pathname = withLocale(lang, '/tools')
  const navigation = createToolsNavigation(pathname, {
    themeCustomizer: t('tools.theme-customizer'),
    snapshotInspector: t('tools.snapshot-inspector'),
    initializationGenerator: t('tools.initialization-generator'),
  })
  const guideNavigation = createGuideNavigation(guideNavigationSource.pageTree[lang], pathname)

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <DocsHeader
        guideItems={guideNavigation.items}
        items={navigation.items}
        lang={lang}
        searchScope="all"
        title={t('tools.section')}
      />
      <ToolsWorkspace items={navigation.items}>
        {children}
        <Footer variant="content" className="mt-8 pt-4 text-xs" />
      </ToolsWorkspace>
    </div>
  )
}
