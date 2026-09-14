import type { ReactNode } from 'react'
import { ChevronRightIcon, ExternalLinkIcon, FolderIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

import type { INavTreeItem } from './nav-tree'

function isActive(item: INavTreeItem, pathname: string): boolean {
  if (item.url === pathname) return true
  return item.children.some((child) => isActive(child, pathname))
}

function getControlsId(item: INavTreeItem) {
  return `nav-tree-${item.id.replace(/[^\w-]/g, '-')}`
}

function NavContent({ item, showIcon = false }: { item: INavTreeItem; showIcon?: boolean }) {
  return (
    <>
      {showIcon ? (
        <span
          aria-hidden="true"
          className="text-muted-foreground inline-flex size-4 shrink-0 items-center justify-center *:size-4! *:min-w-4! *:rounded-none! *:border-0! *:bg-transparent! *:bg-none! *:p-0! *:shadow-none! [&_svg]:size-4!"
        >
          {item.icon ?? <FolderIcon className="size-4" />}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 wrap-break-word whitespace-normal">{item.name}</span>
      {item.external ? <ExternalLinkIcon className="size-3.5 shrink-0" /> : null}
    </>
  )
}

function NavTreeNode({
  item,
  pathname,
  level,
  showIcon = false,
}: {
  item: INavTreeItem
  pathname: string
  level: number
  showIcon?: boolean
}) {
  const t = useTranslations('navigation')

  if (item.type === 'separator') {
    return (
      <li className="text-muted-foreground mt-5 mb-1 flex items-center gap-2 px-2 text-xs font-semibold tracking-wide first:mt-0">
        <NavContent item={item} showIcon={Boolean(item.icon)} />
      </li>
    )
  }

  const active = isActive(item, pathname)
  const current = item.url === pathname
  const hasChildren = item.children.length > 0
  const controlsId = hasChildren ? getControlsId(item) : undefined
  const rowClassName = clsx(
    `hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-ring/60 flex min-h-11 w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm leading-5 transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset md:min-h-8`,
    hasChildren
      ? 'text-foreground text-[13px] font-semibold'
      : current
        ? 'bg-accent text-accent-foreground font-medium'
        : 'text-muted-foreground font-normal',
  )
  const style = { paddingInlineStart: `${0.5 + level * 1.5}rem` }

  if (hasChildren) {
    return (
      <li>
        <details className="group" open={active || (item.defaultOpen ?? level === 0)}>
          <summary
            aria-controls={controlsId}
            className={clsx(rowClassName, `cursor-pointer list-none [&::-webkit-details-marker]:hidden`)}
            style={style}
          >
            <NavContent item={item} showIcon={level === 0} />
            <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0 transition-transform [[open]>summary_&]:rotate-90" />
          </summary>
          <ul className="mt-0.5 space-y-0.5" id={controlsId}>
            {item.children.map((child, index) => (
              <NavTreeNode
                item={
                  index === 0 && !child.children.length && child.name.trim() === item.name.trim()
                    ? { ...child, name: t('overview') }
                    : child
                }
                key={child.id}
                level={level + 1}
                pathname={pathname}
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
          aria-current={current ? 'page' : undefined}
          className={rowClassName}
          href={item.url}
          rel={item.external ? 'noreferrer' : undefined}
          style={style}
          target={item.external ? '_blank' : undefined}
        >
          <NavContent item={item} showIcon={showIcon} />
        </Link>
      </li>
    )
  }

  return (
    <li>
      <span className={rowClassName} style={style}>
        <NavContent item={item} showIcon={showIcon} />
      </span>
    </li>
  )
}

export function ReferenceNavTree({ items, pathname }: { items: INavTreeItem[]; pathname: string }) {
  let sectionHasIcon = false
  let inSection = false
  const nodes: ReactNode[] = []
  for (const item of items) {
    if (item.type === 'separator') {
      inSection = true
      sectionHasIcon = Boolean(item.icon)
    }
    nodes.push(
      <NavTreeNode
        item={item}
        key={item.id}
        level={sectionHasIcon && item.type !== 'separator' && !item.children.length ? 1 : 0}
        pathname={pathname}
        showIcon={!inSection && Boolean(item.icon)}
      />,
    )
  }
  return <ul className="space-y-0.5">{nodes}</ul>
}
