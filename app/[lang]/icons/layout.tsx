import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/notebook'

import { baseOptions } from '@/app/layout.config'
import { SidebarVersionSwitcher } from '@/components/sidebar-version-switcher'
import { icons } from '@/lib/source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={icons.pageTree[lang]}
      tabMode="navbar"
      sidebar={{
        banner: <SidebarVersionSwitcher key="version" lang={lang} />,
        defaultOpenLevel: 0,
      }}
    >
      {children}
    </DocsLayout>
  )
}
