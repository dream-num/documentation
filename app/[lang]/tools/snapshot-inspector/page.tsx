import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'

import { SnapshotInspectorTool } from './snapshot-inspector-tool'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return {
    title: t('tools.snapshot-inspector'),
    description: t('tools.snapshot-inspector-description'),
  }
}

export default function Page() {
  return <SnapshotInspectorTool />
}
