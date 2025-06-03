import type { Metadata } from 'next'
import { Layout } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import Banner from '@/components/banner'
import Copyright from '@/components/copyright'
import DocSearch from '@/components/doc-search'
import Navbar from '@/components/navbar'
import TocBackToTop from '@/components/toc-back-to-top'

import { version } from '../../package.json'

import '@/styles/globals.css'
import 'nextra-theme-docs/style.css'
import '@/showcase/styles'

interface IRootLayoutProps {
  children: React.ReactNode
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: IRootLayoutProps): Promise<Metadata> {
  const { lang } = await params

  return {
    description: 'Univer is a full-stack framework for creating, editing, and collaborating on spreadsheets, documents, and slides across web and server environments. Empower your workflow with server-driven productivity tools, real-time collaboration, and enterprise-grade integration. Deploy on-premise or in the cloud for secure, scalable document management.',
    keywords: 'JavaScript sheet, Node sheet, JavaScript spreadsheet, Node.js spreadsheet, spreadsheet SDK, web spreadsheet editor, server-side spreadsheet, full-stack document editing, Univer, productivity tools, collaborative editor, online spreadsheet, self-hosted office suite, server-driven spreadsheet, self-hosted spreadsheet, js sheet, js spreadsheet',
    other: {
      'docsearch:lang': lang,
    },
  }
}

export default async function RootLayout({ children, params }: IRootLayoutProps) {
  const { lang } = await params
  const pageMap = await getPageMap(`/${lang}`)

  return (
    <html
      lang={lang}
      dir="ltr"
      suppressHydrationWarning
    >
      <Head />
      <body>
        <Layout
          pageMap={pageMap}
          banner={<Banner version={version} />}
          navbar={<Navbar lang={lang} />}
          search={<DocSearch />}
          footer={<Copyright />}
          toc={{
            backToTop: <TocBackToTop />,

          }}
          feedback={{ content: null }}
          editLink={null}
          docsRepositoryBase="https://github.com/dream-num/univer/tree/main"
          i18n={
            [
              { locale: 'en-US', name: 'English' },
              { locale: 'zh-CN', name: '简体中文' },
            ]
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
