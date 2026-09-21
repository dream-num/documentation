import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'

import { InitializationGeneratorTool } from './initialization-generator-tool'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return {
    title: t('tools.initialization-generator'),
    description: t('tools.initialization-generator-description'),
  }
}

export default function Page() {
  return <InitializationGeneratorTool />
}
