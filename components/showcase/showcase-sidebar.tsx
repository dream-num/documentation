'use client'

import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { clsx } from '@/lib/clsx'

export interface NavItem {
  type: string
  typeKey: string
  title: string
  slug: string
}

interface ShowcaseSidebarProps {
  groupedNav: Record<string, NavItem[]>
  pathname: string
  lang: string
}

const typeColors: Record<string, string> = {
  'Univer Sheets': 'text-emerald-600 dark:text-emerald-400',
  'Univer Docs': 'text-blue-600 dark:text-blue-400',
  'Univer Slides': 'text-rose-600 dark:text-rose-400',
}

export function ShowcaseSidebar({ groupedNav, pathname }: ShowcaseSidebarProps) {
  return (
    <aside
      className={`
        fixed hidden h-[calc(100vh-108px)] shrink-0 overflow-hidden
        lg:block
      `}
    >
      <div className="h-full pt-4">
        <ScrollArea className="h-full">
          {Object.entries(groupedNav).map(([type, items]) => (
            <div
              key={type}
              className={`
                mb-4
                last:mb-24
              `}
            >
              <label
                className={clsx(`mb-2 px-2 text-xs font-semibold tracking-wider uppercase`, typeColors[type] || `
                  text-neutral-400
                  dark:text-neutral-600
                `)}
              >
                {type}
              </label>

              {items.map(item => (
                <div key={item.slug} className="mb-0.5">
                  <Link
                    href={`/showcase/${item.slug}`}
                    className={clsx(`block rounded-md px-2 py-1.5 text-sm font-medium transition-colors`, {
                      'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100': item.slug === pathname,
                      'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200': item.slug !== pathname,
                    })}
                  >
                    <span className="line-clamp-1">{item.title}</span>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </ScrollArea>
      </div>
    </aside>
  )
}
