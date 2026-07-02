import type { GuideNavItem } from '@/lib/guides/navigation'
import { ActiveNavScroller } from '@/components/docs-shell/active-nav-scroller'
import { NavTree } from '@/components/docs-shell/nav-tree'
import { clsx } from '@/lib/clsx'
import { isGuideNavItemActive } from '@/lib/guides/navigation'
import { GuidesSidebarControls } from './sidebar-controls'

export function GuidesSidebar({
  items,
  pathname,
  label,
  labels,
  className,
}: {
  items: GuideNavItem[]
  pathname: string
  label: string
  labels: {
    guides: string
    products: string
  }
  className?: string
}) {
  const activeRoot = items.find(item => item.type !== 'separator' && isGuideNavItemActive(item, pathname))
  const visibleItems = activeRoot?.children.length ? activeRoot.children : items

  return (
    <nav
      aria-label={label}
      className={clsx('text-sm', className)}
    >
      <GuidesSidebarControls includeIcons items={items} labels={labels} pathname={pathname} />
      <NavTree items={visibleItems} pathname={pathname} />
      <ActiveNavScroller pathname={pathname} />
    </nav>
  )
}
