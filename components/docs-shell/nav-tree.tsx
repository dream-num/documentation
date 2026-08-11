import type { ReactNode } from 'react'
import { ChevronRightIcon, ExternalLinkIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

import { NavIconFrame } from './nav-icon-frame'

export interface INavTreeItem {
  id: string
  type: 'page' | 'folder' | 'link' | 'separator'
  name: string
  url?: string
  icon?: ReactNode
  external?: boolean
  children: INavTreeItem[]
}

function isActive(item: INavTreeItem, pathname: string): boolean {
  if (item.url === pathname) return true
  return item.children.some((child) => isActive(child, pathname))
}

function getControlsId(item: INavTreeItem) {
  return `nav-tree-${item.id.replace(/[^\w-]/g, '-')}`
}

function NavContent({ item }: { item: INavTreeItem }) {
  return (
    <>
      {item.icon ? <NavIconFrame icon={item.icon} /> : null}
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
      {item.external ? <ExternalLinkIcon className="size-3.5 shrink-0" /> : null}
    </>
  )
}

function NavTreeNode({ item, pathname, level }: { item: INavTreeItem; pathname: string; level: number }) {
  if (item.type === 'separator') {
    return (
      <li className="text-muted-foreground mt-5 px-2 text-xs font-medium tracking-normal first:mt-0">{item.name}</li>
    )
  }

  const active = isActive(item, pathname)
  const current = item.url === pathname
  const hasChildren = item.children.length > 0
  const controlsId = hasChildren ? getControlsId(item) : undefined
  const rowClassName = clsx(
    `hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-ring/60 flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset`,
    current ? 'bg-accent text-accent-foreground' : active ? 'text-foreground' : 'text-muted-foreground',
  )
  const style = { paddingInlineStart: `${0.5 + level * 0.25}rem` }

  if (hasChildren) {
    return (
      <li>
        <details className="group" open={level === 0 || active}>
          <summary
            aria-controls={controlsId}
            className={clsx(rowClassName, `cursor-pointer list-none [&::-webkit-details-marker]:hidden`)}
            style={style}
          >
            <NavContent item={item} />
            <ChevronRightIcon className="size-3.5 shrink-0 transition-transform group-open:rotate-90" />
          </summary>
          <ul
            className={clsx('border-border/70 mt-1 ml-5.5 space-y-1 border-l pl-1.5', level > 0 && 'ml-4')}
            id={controlsId}
          >
            {item.children.map((child) => (
              <NavTreeNode item={child} key={child.id} level={level + 1} pathname={pathname} />
            ))}
          </ul>
        </details>
      </li>
    )
  }

  if (item.url) {
    return (
      <li>
        <Link
          aria-current={current ? 'page' : undefined}
          className={rowClassName}
          href={item.url}
          rel={item.external ? 'noreferrer' : undefined}
          style={style}
          target={item.external ? '_blank' : undefined}
        >
          <NavContent item={item} />
        </Link>
      </li>
    )
  }

  return (
    <li>
      <span className={rowClassName} style={style}>
        <NavContent item={item} />
      </span>
    </li>
  )
}

export function NavTree({ items, pathname }: { items: INavTreeItem[]; pathname: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <NavTreeNode item={item} key={item.id} level={0} pathname={pathname} />
      ))}
    </ul>
  )
}
