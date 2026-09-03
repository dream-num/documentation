import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { DocsShellLayout } from '@/components/docs-shell/layout'
import { createDocsNavigation } from '@/lib/docs/navigation'
import { reference } from '@/lib/source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })
  const navigation = createDocsNavigation(reference.pageTree[lang], '')

  return (
    <DocsShellLayout lang={lang} navigation={navigation} searchScope="reference" title={t('navigation.reference')}>
      {children}
    </DocsShellLayout>
  )
}
