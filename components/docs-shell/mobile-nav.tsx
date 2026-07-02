import type { ReactNode } from 'react'
import type { DocsNavItem } from '@/lib/docs/navigation'
import { MenuIcon } from 'lucide-react'
import { DocsSidebar } from './sidebar'

export function DocsMobileNav({
  headerExtra,
  items,
  navigationLabel,
  openLabel,
  pathname,
  title,
}: {
  headerExtra?: ReactNode
  items: DocsNavItem[]
  navigationLabel: string
  openLabel: string
  pathname: string
  title: string
}) {
  return (
    <details
      className="
        group
        lg:hidden
      "
    >
      <summary
        aria-label={openLabel}
        className="
          inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-md transition-colors
          hover:bg-accent hover:text-accent-foreground
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
          [&::-webkit-details-marker]:hidden
        "
      >
        <MenuIcon className="size-5" />
      </summary>
      <div
        className="
          fixed top-16 left-0 z-50 flex h-[calc(100dvh-4rem)] w-[min(22rem,calc(100vw-2rem))] flex-col border-r
          bg-background shadow-lg
        "
      >
        <div className="border-b p-4">
          <p className="text-lg font-semibold tracking-normal">{title}</p>
          {headerExtra ? <div className="mt-3">{headerExtra}</div> : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <DocsSidebar items={items} label={navigationLabel} pathname={pathname} />
        </div>
      </div>
    </details>
  )
}
