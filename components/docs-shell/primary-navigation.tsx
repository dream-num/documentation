import type { IGuideNavItem } from '@/lib/guides/navigation'
import { ActiveNavigationLink } from '@/components/site/active-navigation-link'
import { clsx } from '@/lib/clsx'
import { getGuideSdkItems } from '@/lib/guides/navigation'

export interface IPrimaryNavigationLabels {
  blog: string
  overview: string
  primary: string
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
  const links = [
    { text: labels.overview, url: '/overview', activeHref: '/overview' },
    ...getGuideSdkItems(items).map((item) => ({
      text: item.name,
      url: item.id === 'guides' ? '/guides/sheets' : `/${item.id}`,
      activeHref: `/${item.id}`,
    })),
    ...(mobile
      ? []
      : [
          { text: labels.tools, url: '/tools/theme-customizer' },
          { text: labels.blog, url: '/blog' },
          { text: labels.showcase, url: 'https://office.univer.ai' },
        ]),
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
          activeClassName="bg-accent text-accent-foreground font-medium"
          className="shrink-0 rounded-md px-2 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:px-2.5"
          href={link.url}
          activeHref={'activeHref' in link ? link.activeHref : link.url}
          key={link.url}
        >
          {link.text}
        </ActiveNavigationLink>
      ))}
    </nav>
  )
}
