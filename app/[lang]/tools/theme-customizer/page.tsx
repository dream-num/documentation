import type { Locale } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { ToolsShell } from '@/components/tools/tools-shell'
import { withLocale } from '@/lib/locale-path'
import { ThemeCustomizerTool } from './theme-customizer-tool'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return {
    title: t('tools.theme-customizer'),
    description: t('tools.theme-customizer-description'),
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })
  const pathname = withLocale(lang, '/tools/theme-customizer')

  return (
    <ToolsShell lang={lang} pathname={pathname}>
      <ThemeCustomizerTool
        description={t('tools.theme-customizer-description')}
        title={t('tools.theme-customizer')}
      />
    </ToolsShell>
  )
}
