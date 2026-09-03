'use client'

import type { IDocsNavItem } from '@/lib/docs/navigation'
import { usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

import { ActiveNavScroller } from './active-nav-scroller'
import { NavTree } from './nav-tree'

export function DocsSidebar({ items, label, className }: { items: IDocsNavItem[]; label: string; className?: string }) {
  const pathname = usePathname()

  return (
    <nav aria-label={label} className={clsx('text-sm', className)}>
      <NavTree items={items} pathname={pathname} />
      <ActiveNavScroller />
    </nav>
  )
}
