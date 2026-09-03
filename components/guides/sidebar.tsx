'use client'

import type { IGuideNavItem } from '@/lib/guides/navigation'
import { ActiveNavScroller } from '@/components/docs-shell/active-nav-scroller'
import { NavTree } from '@/components/docs-shell/nav-tree'
import { usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { isGuideNavItemActive } from '@/lib/guides/navigation'

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
  const pathname = usePathname()
  const activeRoot = items.find((item) => item.type !== 'separator' && isGuideNavItemActive(item, pathname))
  const visibleItems = activeRoot?.children.length ? activeRoot.children : items

  return (
    <nav aria-label={label} className={clsx('text-sm', className)}>
      <GuidesSidebarControls includeIcons items={items} labels={labels} />
      <NavTree items={visibleItems} pathname={pathname} />
      <ActiveNavScroller />
    </nav>
  )
}
