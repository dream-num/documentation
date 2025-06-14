import type { ReactNode } from 'react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params

  return (
    <HomeLayout
      {...baseOptions(lang)}
      links={[{
        text: 'Univer Sheets',
        url: `/${lang}/guides/sheets`,
      }, {
        text: 'Univer Docs',
        url: `/${lang}/guides/docs`,
      }, {
        text: 'Blog',
        url: `/${lang}/blog`,
      }]}
    >
      {children}
    </HomeLayout>
  )
}
