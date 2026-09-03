import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { DocsShellLayout } from '@/components/docs-shell/layout'
import { createDocsNavigation } from '@/lib/docs/navigation'
import { icons } from '@/lib/source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })
  const navigation = createDocsNavigation(icons.pageTree[lang], '')

  return (
    <DocsShellLayout lang={lang} navigation={navigation} searchScope="icons" title={t('search.scope.icons')}>
      {children}
    </DocsShellLayout>
  )
}
