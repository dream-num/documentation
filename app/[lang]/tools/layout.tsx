import type { ReactNode } from 'react'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { ToolsShell } from '@/components/tools/tools-shell'
import { routing } from '@/i18n/routing'

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) notFound()
  return <ToolsShell lang={lang}>{children}</ToolsShell>
}
