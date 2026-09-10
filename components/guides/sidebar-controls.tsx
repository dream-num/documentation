'use client'

import type { ReactNode } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import type { IGuideNavItem } from '@/lib/guides/navigation'
import { NavIconFrame } from '@/components/docs-shell/nav-icon-frame'
import { SidebarVersionSwitcher } from '@/components/docs-shell/sidebar-version-switcher'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link, usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { getActiveGuideProduct, getGuideNavItemHref, getGuideProductItems } from '@/lib/guides/navigation'
import { isPathActive } from '@/lib/locale-path'

function ControlIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        `bg-background text-primary grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border *:grid! *:size-4! *:min-w-4! *:place-items-center! *:border-0! *:bg-transparent! *:p-0! *:shadow-none! [&_svg]:size-4!`,
        className,
      )}
    >
      {children}
    </span>
  )
}

function ProductIcon({ item }: { item?: IGuideNavItem }) {
  if (item?.icon) {
    return <ControlIcon>{item.icon}</ControlIcon>
  }

  return (
    <ControlIcon>
      <span className="text-base font-semibold">U</span>
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
  const productItems = getGuideProductItems(items)
  const currentProduct = getActiveGuideProduct(items, pathname)
  const shouldShowProduct = isPathActive(pathname, '/guides') && productItems.length > 0

  return (
    <div className="flex flex-col gap-2 pb-4">
      <SidebarVersionSwitcher />

      {shouldShowProduct ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-ring/60 flex w-full items-center gap-2 rounded-md p-1 text-left transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset"
                type="button"
              />
            }
          >
            <ProductIcon item={currentProduct} />
            <span className="min-w-0 flex-1">
              <span className="text-foreground block truncate text-sm font-semibold">
                {currentProduct?.name ?? labels.products}
              </span>
              <span className="text-muted-foreground block truncate text-sm">
                {currentProduct?.description ?? labels.guides}
              </span>
            </span>
            <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {productItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                render={<Link className="min-h-10 justify-between" href={getGuideNavItemHref(item) ?? '#'} />}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {item.icon ? <NavIconFrame icon={item.icon} /> : null}
                  <span className="truncate">{item.name}</span>
                </span>
                {item.id === currentProduct?.id ? <CheckIcon className="ml-auto size-4" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
