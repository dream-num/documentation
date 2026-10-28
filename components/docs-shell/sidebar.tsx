'use client'

import { useRef } from 'react'
import type { IDocsNavItem } from '@/lib/docs/navigation'
import { usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { ActiveNavScroller } from './active-nav-scroller'
import { NavTree } from './nav-tree'
import { ReferenceNavTree } from './reference-nav-tree'

export function DocsSidebar({ items, label, className }: { items: IDocsNavItem[]; label: string; className?: string }) {
  const activeItemRef = useRef<HTMLAnchorElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  return (
    <nav ref={navRef} aria-label={label} className={clsx('text-sm', className)}>
      {pathname === '/reference' || pathname.startsWith('/reference/') ? (
        <ReferenceNavTree items={items} pathname={pathname} activeItemRef={activeItemRef} />
      ) : (
        <NavTree items={items} pathname={pathname} activeItemRef={activeItemRef} />
      )}
      <ActiveNavScroller activeItemRef={activeItemRef} navRef={navRef} />
    </nav>
  )
}
