'use client'

import type { ReactNode } from 'react'
import { ArrowLeftIcon, CheckIcon, ChevronsUpDownIcon, LayersIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
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

function ControlIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        `grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border bg-background text-primary *:grid! *:size-4! *:min-w-4! *:place-items-center! *:border-0! *:bg-transparent! *:p-0! *:shadow-none! [&_svg]:size-4!`,
        className,
      )}
    >
      {children}
    </span>
  )
}

function SectionIcon({ item }: { item?: IGuideNavItem }) {
  if (item?.icon) {
    return <ControlIcon>{item.icon}</ControlIcon>
  }

  return (
    <ControlIcon>
      <LayersIcon aria-hidden="true" />
    </ControlIcon>
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
  const currentSdk = getActiveGuideSdk(items, pathname)
  const sectionItems = getGuideSectionItems(items, pathname)
  const currentSection = sectionItems.find((item) => isGuideNavItemActive(item, pathname))
  const isWebSdk = currentSdk?.id === 'guides'
  const sdkHref = currentSdk ? getGuideNavItemHref(currentSdk) : undefined

  return (
    <div className="flex flex-col gap-2 pb-4">
      <div className="space-y-3 px-1 pb-2">
        {currentSdk ? (
          <Link
            href="/docs/overview"
            className="flex min-h-8 items-center gap-1.5 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
            {t('office.overview')}
          </Link>
        ) : null}
        <h2 className="text-base font-semibold text-foreground">{currentSdk?.name ?? 'Office SDK'}</h2>
      </div>
      <SidebarVersionSwitcher />

      {sectionItems.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex w-full items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-inset"
                type="button"
              />
            }
          >
            <SectionIcon item={currentSection ?? currentSdk} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {currentSection?.name ?? (isWebSdk ? labels.products : t('office.modules'))}
              </span>
              <span className="block truncate text-sm text-muted-foreground">
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
                  <Link className="min-h-10 justify-between" href={getGuideSectionSwitchHref(item, pathname) ?? '#'} />
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
      ) : null}
    </div>
  )
}
