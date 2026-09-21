import type { ReactNode } from 'react'

import { ToolsShell } from '@/components/tools/tools-shell'

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <ToolsShell lang={lang}>{children}</ToolsShell>
}
