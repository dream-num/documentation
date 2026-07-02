import type { DocsNavItem } from '@/lib/docs/navigation'
import { clsx } from '@/lib/clsx'
import { ActiveNavScroller } from './active-nav-scroller'
import { NavTree } from './nav-tree'

export function DocsSidebar({
  items,
  pathname,
  label,
  className,
}: {
  items: DocsNavItem[]
  pathname: string
  label: string
  className?: string
}) {
  return (
    <nav
      aria-label={label}
      className={clsx('text-sm', className)}
    >
      <NavTree items={items} pathname={pathname} />
      <ActiveNavScroller pathname={pathname} />
    </nav>
  )
}
