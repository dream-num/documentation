import type { GuideNavItem } from '@/lib/guides/navigation'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import Link from 'next/link'
import { NavIconFrame } from '@/components/docs-shell/nav-icon-frame'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UniverIcon } from '@/components/univer-icon'
import { clsx } from '@/lib/clsx'
import {
  getActiveGuideProduct,
  getGuideNavItemHref,
  getGuideProductItems,
  getGuideStandaloneItems,
  isGuideNavItemActive,
} from '@/lib/guides/navigation'
import { isPathActive, withLocale } from '@/lib/locale-path'

export interface PrimaryNavigationLabels {
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

function ProductSwitcher({
  items,
  label,
  pathname,
}: {
  items: GuideNavItem[]
  label: string
  pathname: string
}) {
  const iconsProduct = getIconsProductItem()
  const productItems = [...getGuideProductItems(items), iconsProduct]
  const currentProduct = isPrimaryLinkActive(pathname, iconsProduct.url ?? '')
    ? iconsProduct
    : getActiveGuideProduct(items, pathname)

  if (productItems.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="
            group inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm whitespace-nowrap text-muted-foreground
            transition-colors
            hover:bg-accent hover:text-accent-foreground
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
          "
          type="button"
        >
          <span className="max-w-32 truncate">{label}</span>
          <ChevronDownIcon
            className="
              size-3.5 transition-transform
              group-data-[state=open]:rotate-180
            "
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {productItems.map(item => (
          <DropdownMenuItem asChild key={item.id}>
            <Link
              className="min-h-10 justify-between"
              href={getGuideNavItemHref(item) ?? '#'}
            >
              <span className="flex min-w-0 items-center gap-2">
                {item.icon
                  ? <NavIconFrame icon={item.icon} />
                  : null}
                <span className="truncate">{item.name}</span>
              </span>
              {item.id === currentProduct?.id ? <CheckIcon className="size-4" /> : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PrimaryNavigation({
  items,
  lang,
  labels,
  pathname,
}: {
  items: GuideNavItem[]
  lang: string
  labels: PrimaryNavigationLabels
  pathname: string
}) {
  const standaloneItems = getGuideStandaloneItems(items)
  const links = [
    {
      text: labels.tools,
      url: withLocale(lang, '/tools/theme-customizer'),
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
    <nav
      aria-label={labels.primary}
      className="
        hidden items-center gap-1
        lg:flex
      "
    >
      <ProductSwitcher items={items} label={labels.products} pathname={pathname} />
      {standaloneItems.map(item => (
        <Link
          className={clsx(
            `
              rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors
              hover:bg-accent hover:text-accent-foreground
            `,
            isGuideNavItemActive(item, pathname) && 'bg-accent text-accent-foreground',
          )}
          href={getGuideNavItemHref(item) ?? '#'}
          key={item.id}
        >
          {item.name}
        </Link>
      ))}
      {links.map(link => (
        <Link
          className={clsx(
            `
              rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors
              hover:bg-accent hover:text-accent-foreground
            `,
            isPrimaryLinkActive(pathname, link.url) && 'bg-accent text-accent-foreground',
          )}
          href={link.url}
          key={link.url}
        >
          {link.text}
        </Link>
      ))}
    </nav>
  )
}
