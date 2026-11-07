'use client'

import { ArrowLeftIcon, CheckIcon, ChevronsUpDownIcon, LayersIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import type { IGuideNavItem } from '@/lib/guides/navigation'
import { NavIconFrame } from '@/components/docs-shell/nav-icon-frame'
import { SidebarVersionSwitcher } from '@/components/docs-shell/sidebar-version-switcher'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link, usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import {
  getActiveGuideSdk,
  getGuideNavItemHref,
  getGuideSectionItems,
  getGuideSectionSwitchHref,
  isGuideNavItemActive,
} from '@/lib/guides/navigation'

function SectionIcon({ item }: { item?: IGuideNavItem }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border bg-background text-primary *:grid! *:size-4! *:min-w-4! *:place-items-center! *:border-0! *:bg-transparent! *:p-0! *:shadow-none! [&_svg]:size-4!">
      {item?.icon ? item.icon : <LayersIcon aria-hidden="true" />}
    </span>
  )
}

export function GuidesSidebarControls({
  items,
  labels,
}: {
  items: IGuideNavItem[]
  labels: {
    guides: string
    products: string
  }
}) {
  const pathname = usePathname()
  const t = useTranslations()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sectionButtonRef = useRef<HTMLButtonElement>(null)
  const [compact, setCompact] = useState(false)
  const currentSdk = getActiveGuideSdk(items, pathname)
  const sectionItems = getGuideSectionItems(items, pathname)
  const currentSection = sectionItems.find((item) => isGuideNavItemActive(item, pathname))
  const isWebSdk = currentSdk?.id === 'guides'
  const sdkHref = currentSdk ? getGuideNavItemHref(currentSdk) : undefined
  const hasSections = sectionItems.length > 0

  useEffect(() => {
    const sentinel = sentinelRef.current
    const button = sectionButtonRef.current
    const scrollContainer = sentinel?.closest('[data-guide-sidebar-scroll]')
    if (!sentinel || !button || !scrollContainer) return

    let currentCompact = button.parentElement?.dataset.compact === 'true'
    let disposed = false

    const syncCompact = () => {
      if (disposed || !scrollContainer.getClientRects().length) return
      const nextCompact = sentinel.getBoundingClientRect().top <= scrollContainer.getBoundingClientRect().top
      if (nextCompact === currentCompact) return
      currentCompact = nextCompact
      setCompact(nextCompact)
    }

    const observer = new ResizeObserver(syncCompact)
    observer.observe(scrollContainer)
    if (sentinel.parentElement) observer.observe(sentinel.parentElement)
    scrollContainer.addEventListener('scroll', syncCompact, { passive: true })
    syncCompact()

    return () => {
      disposed = true
      observer.disconnect()
      scrollContainer.removeEventListener('scroll', syncCompact)
    }
  }, [hasSections])

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="space-y-3 px-1 pb-2">
          {currentSdk ? (
            <Link
              href="/overview"
              className="flex min-h-8 items-center gap-1.5 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
              {t('office.overview')}
            </Link>
          ) : null}
          <h2 className="text-base font-semibold text-foreground">{currentSdk?.name ?? 'Office SDK'}</h2>
        </div>
        <SidebarVersionSwitcher />
      </div>

      {hasSections ? (
        <>
          <div ref={sentinelRef} aria-hidden="true" className="-mb-px h-px" />
          {/* Keep the scroll range stable while the button compacts. */}
          <div
            data-compact={compact}
            className="sticky top-0 z-20 h-16 bg-linear-to-b from-sidebar from-80% to-transparent pt-2"
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    ref={sectionButtonRef}
                    className={clsx(
                      'flex w-full items-center gap-2 rounded-md bg-sidebar p-1 text-left transition-[height,background-color,color] duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none',
                      compact ? 'h-10' : 'h-12',
                    )}
                    type="button"
                  />
                }
              >
                <SectionIcon item={currentSection ?? currentSdk} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {currentSection?.name ?? (isWebSdk ? labels.products : t('office.modules'))}
                  </span>
                  <span
                    aria-hidden={compact}
                    className={clsx(
                      'block truncate text-sm text-muted-foreground transition-[height,opacity,visibility] duration-150 ease-out motion-reduce:transition-none',
                      compact ? 'invisible h-0 opacity-0' : 'visible h-5 opacity-100',
                    )}
                  >
                    {currentSection?.description ?? currentSdk?.name}
                  </span>
                </span>
                <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {!isWebSdk && sdkHref ? (
                  <DropdownMenuItem render={<Link className="min-h-10 justify-between" href={sdkHref} />}>
                    {t('navigation.overview')}
                    {!currentSection ? <CheckIcon aria-hidden="true" className="ml-auto size-4" /> : null}
                  </DropdownMenuItem>
                ) : null}
                {sectionItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    render={
                      <Link
                        className="min-h-10 justify-between"
                        href={getGuideSectionSwitchHref(item, pathname) ?? '#'}
                      />
                    }
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {item.icon ? <NavIconFrame icon={item.icon} /> : null}
                      <span className="truncate">{item.name}</span>
                    </span>
                    {item.id === currentSection?.id ? <CheckIcon className="ml-auto size-4" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : null}
    </>
  )
}
