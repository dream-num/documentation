import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/notebook'

import { baseOptions } from '@/app/layout.config'
import { SidebarVersionSwitcher } from '@/components/sidebar-version-switcher'
import { reference } from '@/lib/source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={reference.pageTree[lang]}
      tabMode="navbar"
      sidebar={{
        banner: <SidebarVersionSwitcher key="version" lang={lang} />,
        defaultOpenLevel: 1,
      }}
    >
      {children}
    </DocsLayout>
  )
}
