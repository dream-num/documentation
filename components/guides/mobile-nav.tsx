'use client'

import { MenuIcon } from 'lucide-react'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { usePathname } from '@/i18n/navigation'
import { GuidesSidebar } from './sidebar'

export function GuidesMobileNav({
  items,
  labels,
  navigationLabel,
  openLabel,
}: {
  items: IGuideNavItem[]
  labels: {
    guides: string
    products: string
  }
  navigationLabel: string
  openLabel: string
}) {
  const pathname = usePathname()
  return (
    <details key={pathname} className="group lg:hidden">
      <summary
        aria-label={openLabel}
        className="inline-flex size-8 cursor-pointer list-none items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden"
      >
        <MenuIcon className="size-4" />
      </summary>
      <div className="fixed top-22 left-0 z-50 flex h-[calc(100dvh-5.5rem)] w-[min(22rem,calc(100vw-2rem))] flex-col border-r bg-sidebar shadow-lg">
        <div
          data-guide-sidebar-scroll
          className="min-h-0 flex-1 scroll-pt-[calc(var(--nav-section-top,0rem)+2.75rem)] scroll-pb-4 overflow-y-auto mask-b-from-[calc(100%-1rem)] px-3 pb-4 has-[[data-guide-sidebar-switcher]]:[--nav-section-top:4rem]"
        >
          <GuidesSidebar className="pt-4" items={items} label={navigationLabel} labels={labels} />
        </div>
      </div>
    </details>
  )
}
