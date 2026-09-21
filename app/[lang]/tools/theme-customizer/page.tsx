import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'

import { ThemeCustomizerTool } from './theme-customizer-tool'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return {
    title: t('tools.theme-customizer'),
    description: t('tools.theme-customizer-description'),
  }
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })
  return <ThemeCustomizerTool title={t('tools.theme-customizer')} />
}
