import type { ReactNode } from 'react'
import { MenuIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

import { ActiveNavigationLink } from './active-navigation-link'

export interface ISiteNavLink {
  text: string
  url: string
}

export interface ISiteDocumentationLink extends ISiteNavLink {
  icon?: ReactNode
  iconClassName?: string
}

export function SiteMobileMenu({
  links,
  documentationLinks,
  documentationTitle,
  openLabel,
  navigationLabel,
}: {
  links: ISiteNavLink[]
  documentationLinks: ISiteDocumentationLink[]
  documentationTitle: string
  openLabel: string
  navigationLabel: string
}) {
  return (
    <details className="group lg:hidden">
      <summary
        aria-label={openLabel}
        className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-8 cursor-pointer list-none items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden"
        role="button"
      >
        <MenuIcon className="size-4" />
      </summary>
      <div className="bg-background fixed top-12 left-0 z-50 flex h-[calc(100dvh-3rem)] w-[min(22rem,calc(100vw-2rem))] flex-col border-r shadow-lg">
        <div className="border-b p-4">
          <p className="text-lg font-semibold tracking-normal">Univer SDK</p>
        </div>
        <nav aria-label={navigationLabel} className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {links.map((link) => (
              <ActiveNavigationLink
                activeClassName="bg-accent text-accent-foreground"
                className="hover:bg-accent hover:text-accent-foreground flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors"
                href={link.url}
                key={link.url}
              >
                {link.text}
              </ActiveNavigationLink>
            ))}
          </div>
          <div className="mt-6 border-t pt-5">
            <p className="text-muted-foreground mb-3 px-3 text-xs font-medium">{documentationTitle}</p>
            <div className="space-y-1">
              {documentationLinks.map((link) => (
                <Link
                  className="hover:bg-accent hover:text-accent-foreground flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors"
                  href={link.url}
                  key={link.url}
                >
                  {link.icon ? (
                    <span
                      className={clsx(
                        `flex size-7 shrink-0 items-center justify-center rounded-sm text-white [&_svg]:size-4`,
                        link.iconClassName,
                      )}
                    >
                      {link.icon}
                    </span>
                  ) : null}
                  <span className="font-medium">{link.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </details>
  )
}
