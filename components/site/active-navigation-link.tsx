'use client'

import type { ReactNode } from 'react'
import { ExternalLinkIcon } from 'lucide-react'

import { Link, usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { isPathActive } from '@/lib/locale-path'

interface IActiveNavigationLinkProps {
  activeHref?: string
  activeClassName: string
  children: ReactNode
  className?: string
  href: string
}

export function ActiveNavigationLink({
  activeClassName,
  activeHref,
  children,
  className,
  href,
}: IActiveNavigationLinkProps) {
  const pathname = usePathname()
  const active = isPathActive(pathname, activeHref ?? href)

  return (
    <Link aria-current={active ? 'page' : undefined} className={clsx(className, active && activeClassName)} href={href}>
      {children}
      {href.startsWith('https://') && (
        <ExternalLinkIcon aria-hidden="true" className="ml-1 inline size-3 shrink-0 align-baseline" />
      )}
    </Link>
  )
}
