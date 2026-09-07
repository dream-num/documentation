'use client'

import { ChevronRightIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { ShowcaseCatalogItem } from '@/showcase/catalog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { clsx } from '@/lib/clsx'
import { categoryLabel, productLabel } from '@/showcase/catalog'
import { PRODUCT_IDS, type ShowcaseCategory } from '@/showcase/types'

interface ShowcaseSidebarProps {
  items: ShowcaseCatalogItem[]
  pathname: string
  lang: string
}

const categoryOrder: ShowcaseCategory[] = ['features', 'showcases', 'integrations']

export function ShowcaseSidebar({ items, pathname, lang }: ShowcaseSidebarProps) {
  const current = items.find((item) => item.slug === pathname)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(
    () =>
      new Set([
        `product:${current?.product}`,
        `category:${current?.product}:${current?.category}`,
        `group:${current?.product}:${current?.category}:${current?.group}`,
      ]),
  )

  const filteredItems = useMemo(() => {
    const value = query.trim().toLocaleLowerCase()
    return value ? items.filter((item) => item.searchText.includes(value)) : items
  }, [items, query])

  const toggle = (key: string) => {
    setExpanded((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const isOpen = (key: string) => Boolean(query.trim()) || expanded.has(key)

  return (
    <aside className="fixed hidden h-[calc(100vh-108px)] w-68 shrink-0 overflow-hidden lg:block">
      <div className="flex h-full flex-col pt-4">
        <label className="relative mb-3 block px-1">
          <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={lang === 'zh-CN' ? '搜索功能、变体和 API…' : 'Search features, variants, and APIs…'}
            className="h-9 w-full rounded-md border bg-background pr-2 pl-8 text-xs outline-none focus:ring-2 focus:ring-ring/20"
          />
        </label>

        <ScrollArea className="min-h-0 flex-1">
          {PRODUCT_IDS.map((product) => {
            const productItems = filteredItems.filter((item) => item.product === product)
            if (!productItems.length) return null
            const productKey = `product:${product}`

            return (
              <TreeBranch
                key={product}
                depth={0}
                label={productLabel(product, lang)}
                count={productItems.length}
                open={isOpen(productKey)}
                onToggle={() => toggle(productKey)}
              >
                {categoryOrder.map((category) => {
                  const categoryItems = productItems.filter((item) => item.category === category)
                  if (!categoryItems.length) return null
                  const categoryKey = `category:${product}:${category}`
                  const groups = [...new Set(categoryItems.map((item) => item.group))]

                  return (
                    <TreeBranch
                      key={category}
                      depth={1}
                      label={categoryLabel(category, lang)}
                      count={categoryItems.length}
                      open={isOpen(categoryKey)}
                      onToggle={() => toggle(categoryKey)}
                    >
                      {groups.map((group) => {
                        const groupItems = categoryItems.filter((item) => item.group === group)
                        const groupKey = `group:${product}:${category}:${group}`
                        return (
                          <TreeBranch
                            key={group}
                            depth={2}
                            label={group}
                            count={groupItems.length}
                            open={isOpen(groupKey)}
                            onToggle={() => toggle(groupKey)}
                          >
                            {groupItems.map((item) => (
                              <Link
                                key={item.slug}
                                href={`/showcase/${item.slug}`}
                                className={clsx(
                                  'block rounded-md py-1.5 pr-2 pl-8 text-xs transition-colors',
                                  item.slug === pathname
                                    ? 'bg-neutral-100 font-medium text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50'
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 hover:dark:bg-neutral-800/50 hover:dark:text-neutral-100',
                                )}
                              >
                                <span className="line-clamp-2">{item.title}</span>
                              </Link>
                            ))}
                          </TreeBranch>
                        )
                      })}
                    </TreeBranch>
                  )
                })}
              </TreeBranch>
            )
          })}

          {!filteredItems.length && (
            <p className="px-3 py-8 text-center text-xs text-neutral-500">
              {lang === 'zh-CN' ? '没有匹配的案例' : 'No matching demos'}
            </p>
          )}
          <div className="h-24" />
        </ScrollArea>
      </div>
    </aside>
  )
}

function TreeBranch({
  label,
  count,
  depth,
  open,
  onToggle,
  children,
}: {
  label: string
  count: number
  depth: 0 | 1 | 2
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={depth === 0 ? 'mb-2' : ''}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={clsx(
          'flex w-full items-center gap-1 rounded-md py-1.5 pr-2 text-left hover:bg-neutral-50 hover:dark:bg-neutral-800/50',
          depth === 0
            ? 'pl-1 text-sm font-semibold'
            : depth === 1
              ? 'pl-3 text-xs font-semibold'
              : 'pl-5 text-xs font-medium',
        )}
      >
        <ChevronRightIcon className={clsx('size-3.5 shrink-0 transition-transform', open && 'rotate-90')} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="text-[10px] font-normal text-neutral-400">{count}</span>
      </button>
      {open && children}
    </div>
  )
}
