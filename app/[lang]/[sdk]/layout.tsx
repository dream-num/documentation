import type { ReactNode } from 'react'

import { GuidesLayout } from '@/components/guides/layout'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guideNavigationSource } from '@/lib/guides/navigation-source'

interface IProps {
  params: Promise<{ lang: string }>
  children: ReactNode
}

export default async function Layout({ params, children }: IProps) {
  const { lang } = await params
  const navigation = createGuideNavigation(guideNavigationSource.pageTree[lang], '')

  return (
    <GuidesLayout items={navigation.items} lang={lang}>
      {children}
    </GuidesLayout>
  )
}
