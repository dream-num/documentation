import type { ReactNode } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import type { GuideNavItem } from '@/lib/guides/navigation'
import { NavIconFrame } from '@/components/docs-shell/nav-icon-frame'
import { SidebarVersionSwitcher } from '@/components/docs-shell/sidebar-version-switcher'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { getActiveGuideProduct, getGuideNavItemHref, getGuideProductItems } from '@/lib/guides/navigation'

import { UniverIcon } from '../univer-icon'

function getIconsProductItem(): GuideNavItem {
  return {
    id: 'icons',
    type: 'link',
    name: 'Univer Icons',
    url: '/icons',
    icon: <UniverIcon name="SymbolsIcon" />,
    children: [],
  }
}

function isIconsPath(pathname: string) {
  return /^(?:\/[a-z]{2}(?:-[A-Z]{2})?)?\/icons(?:\/|$)/.test(pathname)
}

function isArchitecturePracticePath(pathname: string) {
  return /^(?:\/[a-z]{2}(?:-[A-Z]{2})?)?\/guides\/recipes\/architecture(?:\/|$)/.test(pathname)
}

function ControlIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        `bg-background text-primary grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border p-2 *:size-5! *:min-w-5! *:border-0! *:bg-transparent! *:p-0! *:shadow-none! [&_svg]:size-4.5!`,
        className,
      )}
    >
      {children}
    </span>
  )
}

function ProductIcon({ item }: { item?: GuideNavItem }) {
  if (item?.icon) {
    return <ControlIcon>{item.icon}</ControlIcon>
  }

  return (
    <ControlIcon>
      <span className="text-base font-semibold">U</span>
    </ControlIcon>
  )
}

function SwitcherSummary({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: ReactNode }) {
  return (
    <button
      className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-ring/60 flex w-full items-center gap-3 rounded-md p-1 text-left transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset"
      type="button"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-sm font-semibold">{title}</span>
        {subtitle ? <span className="text-muted-foreground block truncate text-sm">{subtitle}</span> : null}
      </span>
      <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
    </button>
  )
}

export function GuidesSidebarControls({
  includeIcons = false,
  items,
  labels,
  pathname,
  showVersion = true,
}: {
  includeIcons?: boolean
  items: GuideNavItem[]
  labels: {
    guides: string
    products: string
  }
  pathname: string
  showVersion?: boolean
}) {
  const iconsProduct = getIconsProductItem()
  const productItems = includeIcons ? [...getGuideProductItems(items), iconsProduct] : getGuideProductItems(items)
  const currentProduct = includeIcons && isIconsPath(pathname) ? iconsProduct : getActiveGuideProduct(items, pathname)
  const shouldShowVersion = showVersion && !isArchitecturePracticePath(pathname)
  const shouldShowProduct = Boolean(currentProduct && productItems.length > 0)

  if (!shouldShowVersion && !shouldShowProduct) {
    return null
  }

  return (
    <div className={clsx('flex flex-col gap-3', shouldShowVersion ? 'pb-6' : 'pb-4')}>
      {shouldShowVersion ? <SidebarVersionSwitcher /> : null}

      {shouldShowProduct ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SwitcherSummary
                icon={<ProductIcon item={currentProduct} />}
                title={currentProduct?.name ?? labels.products}
                subtitle={currentProduct?.description ?? labels.guides}
              />
            }
          />
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
                {item.id === currentProduct?.id ? <CheckIcon className="size-4" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
