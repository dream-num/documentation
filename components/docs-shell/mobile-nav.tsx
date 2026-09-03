import type { ReactNode } from 'react'
import { MenuIcon } from 'lucide-react'

import type { IDocsNavItem } from '@/lib/docs/navigation'

import { DocsSidebar } from './sidebar'

export function DocsMobileNav({
  headerExtra,
  items,
  navigationLabel,
  openLabel,
  title,
}: {
  headerExtra?: ReactNode
  items: IDocsNavItem[]
  navigationLabel: string
  openLabel: string
  title: string
}) {
  return (
    <details className="group lg:hidden">
      <summary
        aria-label={openLabel}
        className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-8 cursor-pointer list-none items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden"
      >
        <MenuIcon className="size-4" />
      </summary>
      <div className="bg-background fixed top-12 left-0 z-50 flex h-[calc(100dvh-3rem)] w-[min(22rem,calc(100vw-2rem))] flex-col border-r shadow-lg">
        <div className="border-b p-4">
          <p className="text-lg font-semibold tracking-normal">{title}</p>
          {headerExtra ? <div className="mt-3">{headerExtra}</div> : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <DocsSidebar items={items} label={navigationLabel} />
        </div>
      </div>
    </details>
  )
}
