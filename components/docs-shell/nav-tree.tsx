import type { ReactNode, Ref } from 'react'
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
  defaultOpen?: boolean
  count?: number
  children: INavTreeItem[]
}

function NavContent({ item }: { item: INavTreeItem }) {
  return (
    <>
      {item.icon ? <NavIconFrame icon={item.icon} /> : null}
      <span className="min-w-0 flex-1 wrap-break-word whitespace-normal">{item.name}</span>
      {item.count !== undefined ? (
        <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">{item.count}</span>
      ) : null}
      {item.external ? <ExternalLinkIcon className="size-3.5 shrink-0" /> : null}
    </>
  )
}

function NavTreeNode({
  item,
  pathname,
  level,
  activeItemRef,
}: {
  item: INavTreeItem
  pathname: string
  level: number
  activeItemRef: Ref<HTMLAnchorElement>
}) {
  function isActive(candidate: INavTreeItem): boolean {
    return candidate.url === pathname || candidate.children.some(isActive)
  }

  if (item.type === 'separator') {
    return (
      <li className="mt-5 px-2 text-xs font-medium tracking-normal text-muted-foreground first:mt-0">{item.name}</li>
    )
  }

  const active = isActive(item)
  const current = item.url === pathname
  const hasChildren = item.children.length > 0
  const controlsId = hasChildren ? `nav-tree-${item.id.replace(/[^\w-]/g, '-')}` : undefined
  const rowClassName = clsx(
    `flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm leading-5 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-inset`,
    current ? 'bg-accent text-accent-foreground' : active ? 'text-foreground' : 'text-muted-foreground',
  )
  const style = { paddingInlineStart: `${0.5 + level * 0.25}rem` }

  if (hasChildren) {
    return (
      <li>
        <details key={pathname} className="group" open={active || (item.defaultOpen ?? level === 0)}>
          <summary
            aria-controls={controlsId}
            className={clsx(rowClassName, `cursor-pointer list-none [&::-webkit-details-marker]:hidden`)}
            style={style}
          >
            {item.url ? (
              <Link
                ref={current ? activeItemRef : undefined}
                aria-current={current ? 'page' : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                href={item.url}
              >
                <NavContent item={item} />
              </Link>
            ) : (
              <NavContent item={item} />
            )}
            <ChevronRightIcon className="size-3.5 shrink-0 transition-transform [details[open]>summary>&]:rotate-90" />
          </summary>
          <ul
            className="mt-0.5 space-y-0.5 border-l border-border/70 pl-1.5"
            style={{ marginInlineStart: `${0.5 + level * 0.25 + (item.icon ? 0.75 : 0)}rem` }}
            id={controlsId}
          >
            {item.children.map((child) => (
              <NavTreeNode
                item={child}
                key={child.id}
                level={level + 1}
                pathname={pathname}
                activeItemRef={activeItemRef}
              />
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
          ref={current ? activeItemRef : undefined}
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

export function NavTree({
  items,
  pathname,
  activeItemRef,
}: {
  items: INavTreeItem[]
  pathname: string
  activeItemRef: Ref<HTMLAnchorElement>
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <NavTreeNode item={item} key={item.id} level={0} pathname={pathname} activeItemRef={activeItemRef} />
      ))}
    </ul>
  )
}
