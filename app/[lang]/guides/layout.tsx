import type { ReactNode } from 'react'
import { Banner } from 'fumadocs-ui/components/banner'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import Link from 'next/link'
import { baseOptions } from '@/app/layout.config'
import { customTranslations } from '@/lib/i18n'
import { guides } from '@/lib/source'
import pkg from '@/package.json'

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
      sidebar={{
        defaultOpenLevel: 1,
      }}
    >
      <Banner id={pkg.version} variant="rainbow" changeLayout={false}>
        <Link href={`https://github.com/dream-num/univer/releases/tag/v${pkg.version}`}>
          🎉 Univer v
          {pkg.version}
          {' '}
          {customTranslations[lang]['banner.release']}
        </Link>
      </Banner>
      {children}
    </DocsLayout>
  )
}
