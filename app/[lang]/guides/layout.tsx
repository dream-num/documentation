import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import Link from 'next/link'
import { baseOptions } from '@/app/layout.config'
import { guides } from '@/lib/source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={guides.pageTree[lang]}
    >
      {children}
    </DocsLayout>
  )
}
