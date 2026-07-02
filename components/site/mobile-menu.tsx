import type { ReactNode } from 'react'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { clsx } from '@/lib/clsx'

export interface SiteNavLink {
  text: string
  url: string
}

export interface SiteDocumentationLink extends SiteNavLink {
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
  links: SiteNavLink[]
  documentationLinks: SiteDocumentationLink[]
  documentationTitle: string
  openLabel: string
  navigationLabel: string
}) {
  return (
    <details
      className="
        group
        lg:hidden
      "
    >
      <summary
        aria-label={openLabel}
        className="
          inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-md transition-colors
          hover:bg-accent hover:text-accent-foreground
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
          [&::-webkit-details-marker]:hidden
        "
        role="button"
      >
        <MenuIcon className="size-5" />
      </summary>
      <div
        className="
          fixed top-16 left-0 z-50 flex h-[calc(100dvh-4rem)] w-[min(22rem,calc(100vw-2rem))] flex-col border-r
          bg-background shadow-lg
        "
      >
        <div className="border-b p-4">
          <p className="text-lg font-semibold tracking-normal">Univer</p>
        </div>
        <nav aria-label={navigationLabel} className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {links.map(link => (
              <Link
                className="
                  flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors
                  hover:bg-accent hover:text-accent-foreground
                "
                href={link.url}
                key={link.url}
              >
                {link.text}
              </Link>
            ))}
          </div>
          <div className="mt-6 border-t pt-5">
            <p className="mb-3 px-3 text-xs font-medium text-muted-foreground">
              {documentationTitle}
            </p>
            <div className="space-y-1">
              {documentationLinks.map(link => (
                <Link
                  className="
                    flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors
                    hover:bg-accent hover:text-accent-foreground
                  "
                  href={link.url}
                  key={link.url}
                >
                  {link.icon
                    ? (
                        <span
                          className={clsx(
                            `
                              flex size-7 shrink-0 items-center justify-center rounded-sm text-white
                              [&_svg]:size-4
                            `,
                            link.iconClassName,
                          )}
                        >
                          {link.icon}
                        </span>
                      )
                    : null}
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
