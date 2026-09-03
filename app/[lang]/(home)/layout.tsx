import type { ReactNode } from 'react'
import { StarIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { SiteHeader } from '@/components/site/header'
import { UniverIcon } from '@/components/univer-icon'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guides } from '@/lib/source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })
  const guideNavigation = createGuideNavigation(guides.pageTree[lang], '')
  const documentationTitle = t('navigation.documentation')
  const documentationLinks = [
    {
      text: 'Univer Sheets',
      url: '/guides/sheets',
      icon: <UniverIcon name="SheetsMultiIcon" />,
      iconClassName: 'bg-linear-[135deg,#0DA471_0%,#F3FAF7_100%] dark:bg-linear-[135deg,#0DA471_0%,#014737_100%]',
    },
    {
      text: 'Univer Docs',
      url: '/guides/docs',
      icon: <UniverIcon name="DocsMultiIcon" />,
      iconClassName: 'bg-linear-[135deg,#3F83F8_0%,#EBF5FF_100%] dark:bg-linear-[135deg,#3F83F8_0%,#233876_100%]',
    },
    {
      text: 'Univer Slides',
      url: '/guides/slides',
      icon: <UniverIcon name="SlidesMultiIcon" />,
      iconClassName: 'bg-linear-[135deg,#F05252_0%,#FDF2F2_100%] dark:bg-linear-[135deg,#F05252_0%,#771D1D_100%]',
    },
    {
      text: 'Univer Boards',
      url: '/guides/boards',
      icon: <UniverIcon name="BoardsMultiIcon" />,
      iconClassName: 'bg-linear-[135deg,#14B8A6_0%,#F0FDFA_100%] dark:bg-linear-[135deg,#14B8A6_0%,#134E4A_100%]',
    },
    {
      text: 'Univer Bases',
      url: '/guides/bases',
      icon: <UniverIcon name="BasesMultiIcon" />,
      iconClassName: 'bg-linear-[135deg,#6875F5_0%,#F0F5FF_100%] dark:bg-linear-[135deg,#6875F5_0%,#2A326B_100%]',
    },
    {
      text: 'Univer PDFs',
      url: '/guides/pdfs',
      icon: <UniverIcon name="PdfMultiIcon" />,
      iconClassName: 'bg-linear-[135deg,#F43F5E_0%,#FFF1F2_100%] dark:bg-linear-[135deg,#F43F5E_0%,#881337_100%]',
    },
    {
      text: 'Univer Icons',
      url: '/icons',
      icon: <UniverIcon name="SymbolsIcon" />,
      iconClassName: 'bg-linear-[135deg,#0EA5E9_0%,#F0F9FF_100%] dark:bg-linear-[135deg,#0EA5E9_0%,#0C4A6E_100%]',
    },
    {
      text: 'Univer SDK Pro',
      url: '/guides/pro',
      icon: <StarIcon />,
      iconClassName: 'bg-linear-[135deg,#F59E0B_0%,#FFFBEB_100%] dark:bg-linear-[135deg,#F59E0B_0%,#78350F_100%]',
    },
  ]

  const links = [
    {
      text: t('navigation.reference'),
      url: '/reference/classes/univer',
    },
    {
      text: t('navigation.blog'),
      url: '/blog',
    },
    {
      text: t('navigation.showcase'),
      url: '/showcase',
    },
  ]

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SiteHeader
        documentationLinks={documentationLinks}
        documentationTitle={documentationTitle}
        guideItems={guideNavigation.items}
        lang={lang}
        links={links}
      />
      {children}
    </div>
  )
}
