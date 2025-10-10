import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/notebook'
import { baseOptions } from '@/app/layout.config'
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
        defaultOpenLevel: 1,
      }}
    >
      {children}
    </DocsLayout>
  )
}
