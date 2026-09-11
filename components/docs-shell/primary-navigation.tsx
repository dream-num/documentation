import type { IGuideNavItem } from '@/lib/guides/navigation'
import { ActiveNavigationLink } from '@/components/site/active-navigation-link'
import { clsx } from '@/lib/clsx'
import { getGuideSdkItems } from '@/lib/guides/navigation'

export interface IPrimaryNavigationLabels {
  blog: string
  primary: string
  reference: string
  showcase: string
  tools: string
}

export function PrimaryNavigation({
  items,
  labels,
  mobile = false,
}: {
  items: IGuideNavItem[]
  labels: IPrimaryNavigationLabels
  mobile?: boolean
}) {
  const sdkLinks = getGuideSdkItems(items).map((item) => ({ text: item.name, url: `/${item.id}` }))
  const links = mobile
    ? sdkLinks
    : [
        ...sdkLinks,
        { text: labels.tools, url: '/tools/theme-customizer' },
        { text: labels.reference, url: '/reference' },
        { text: labels.blog, url: '/blog' },
        { text: labels.showcase, url: 'https://office.univer.ai' },
      ]

  return (
    <nav
      aria-label={labels.primary}
      className={clsx(
        'items-center gap-1',
        mobile ? 'flex h-10 overflow-x-auto border-t px-4 lg:hidden' : 'hidden lg:flex',
      )}
    >
      {links.map((link) => (
        <ActiveNavigationLink
          activeClassName="bg-accent text-accent-foreground"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors"
          href={link.url === '/guides' ? '/guides/sheets' : link.url}
          activeHref={link.url}
          key={link.url}
        >
          {link.text}
        </ActiveNavigationLink>
      ))}
    </nav>
  )
}
