'use client'

import { ChevronDownIcon } from 'lucide-react'

import type { IGuideNavItem } from '@/lib/guides/navigation'
import { NavIconFrame } from '@/components/docs-shell/nav-icon-frame'
import { ActiveNavigationLink } from '@/components/site/active-navigation-link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UniverIcon } from '@/components/univer-icon'
import { Link, usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import {
  getGuideNavItemHref,
  getGuideProductItems,
  getGuideStandaloneItems,
  isGuideNavItemActive,
} from '@/lib/guides/navigation'
import { isPathActive } from '@/lib/locale-path'

export interface IPrimaryNavigationLabels {
  blog: string
  primary: string
  products: string
  reference: string
  showcase: string
  tools: string
}

function isPrimaryLinkActive(pathname: string, href: string) {
  return isPathActive(pathname, href)
}

function getIconsProductItem(): IGuideNavItem {
  return {
    id: 'icons',
    type: 'link',
    name: 'Univer Icons',
    url: '/icons',
    icon: <UniverIcon name="SymbolsIcon" />,
    children: [],
  }
}

function ProductSwitcher({ items, label, pathname }: { items: IGuideNavItem[]; label: string; pathname: string }) {
  const iconsProduct = getIconsProductItem()
  const productItems = [...getGuideProductItems(items), iconsProduct]
  const active = productItems.some((item) => {
    const href = getGuideNavItemHref(item)
    return href ? isPrimaryLinkActive(pathname, href) : false
  })

  if (productItems.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={clsx(
              `group text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none`,
              active && 'bg-accent text-accent-foreground',
            )}
            type="button"
          />
        }
      >
        <span className="max-w-32 truncate">{label}</span>
        <ChevronDownIcon className="size-3.5 transition-transform group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {productItems.map((item) => (
          <DropdownMenuItem
            key={item.id}
            render={<Link className="min-h-10 justify-between" href={getGuideNavItemHref(item) ?? '#'} />}
          >
            <span className="flex min-w-0 items-center gap-2">
              {item.icon ? <NavIconFrame icon={item.icon} /> : null}
              <span className="truncate">{item.name}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PrimaryNavigation({ items, labels }: { items: IGuideNavItem[]; labels: IPrimaryNavigationLabels }) {
  const pathname = usePathname()
  const standaloneItems = getGuideStandaloneItems(items)
  const links = [
    {
      text: labels.tools,
      url: '/tools/theme-customizer',
    },
    {
      text: labels.reference,
      url: '/reference/classes/univer',
    },
    {
      text: labels.blog,
      url: '/blog',
    },
    {
      text: labels.showcase,
      url: '/showcase',
    },
  ]

  return (
    <nav aria-label={labels.primary} className="hidden items-center gap-1 lg:flex">
      <ProductSwitcher items={items} label={labels.products} pathname={pathname} />
      {standaloneItems.map((item) => (
        <Link
          className={clsx(
            `text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors`,
            isGuideNavItemActive(item, pathname) && 'bg-accent text-accent-foreground',
          )}
          href={getGuideNavItemHref(item) ?? '#'}
          key={item.id}
        >
          {item.name}
        </Link>
      ))}
      {links.map((link) => (
        <ActiveNavigationLink
          activeClassName="bg-accent text-accent-foreground"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors"
          href={link.url}
          key={link.url}
        >
          {link.text}
        </ActiveNavigationLink>
      ))}
    </nav>
  )
}
