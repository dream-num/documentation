import { MenuIcon } from 'lucide-react'

import type { IGuideNavItem } from '@/lib/guides/navigation'

import { GuidesSidebar } from './sidebar'

export function GuidesMobileNav({
  items,
  labels,
  navigationLabel,
  openLabel,
  pathname,
  title,
}: {
  items: IGuideNavItem[]
  labels: {
    guides: string
    products: string
  }
  navigationLabel: string
  openLabel: string
  pathname: string
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
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <GuidesSidebar items={items} label={navigationLabel} labels={labels} pathname={pathname} />
        </div>
      </div>
    </details>
  )
}
