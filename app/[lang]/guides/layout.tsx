import type { ReactNode } from 'react'
import { Banner } from 'fumadocs-ui/components/banner'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
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
      <Banner id="hello-world" variant="rainbow" changeLayout={false}>Hello World</Banner>
      {children}
    </DocsLayout>
  )
}
