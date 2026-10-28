'use client'

import { useRef } from 'react'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { ActiveNavScroller } from '@/components/docs-shell/active-nav-scroller'
import { NavTree } from '@/components/docs-shell/nav-tree'
import { usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { getGuideSidebarItems } from '@/lib/guides/navigation'
import { GuidesSidebarControls } from './sidebar-controls'

export function GuidesSidebar({
  items,
  label,
  labels,
  className,
}: {
  items: IGuideNavItem[]
  label: string
  labels: {
    guides: string
    products: string
  }
  className?: string
}) {
  const activeItemRef = useRef<HTMLAnchorElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const visibleItems = getGuideSidebarItems(items, pathname)

  return (
    <nav ref={navRef} aria-label={label} className={clsx('text-sm', className)}>
      <GuidesSidebarControls items={items} labels={labels} />
      <NavTree items={visibleItems} pathname={pathname} activeItemRef={activeItemRef} />
      <ActiveNavScroller activeItemRef={activeItemRef} navRef={navRef} />
    </nav>
  )
}
