'use client'

import type { ReactNode } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { isPathActive } from '@/lib/locale-path'

interface IActiveNavigationLinkProps {
  activeClassName: string
  children: ReactNode
  className?: string
  href: string
}

export function ActiveNavigationLink({ activeClassName, children, className, href }: IActiveNavigationLinkProps) {
  const pathname = usePathname()
  const active = isPathActive(pathname, href)

  return (
    <Link aria-current={active ? 'page' : undefined} className={clsx(className, active && activeClassName)} href={href}>
      {children}
    </Link>
  )
}
